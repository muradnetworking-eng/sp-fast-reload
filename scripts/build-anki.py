"""Build and verify the SR-MPLS Anki deck from the application's flashcards.

Requires npm ci and python -m pip install genanki==0.13.1.
Run from the checkout with python scripts/build-anki.py.
"""

from contextlib import closing
from html import escape
import json
from pathlib import Path
import sqlite3
import subprocess
from tempfile import TemporaryDirectory
from zipfile import ZipFile

import genanki

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "downloads" / "sr-mpls" / "sr-mpls.apkg"
DECK_ID = 1888055629
MODEL_ID = 1661307137


def load_cards():
    script = """
        import { cards } from './src/data/technologies/sr-mpls/practice.ts';
        process.stdout.write(JSON.stringify(cards));
    """
    data = subprocess.check_output(
        ["node", "--import", "tsx", "--input-type=module", "-e", script],
        cwd=ROOT,
        encoding="utf-8",
    )
    cards = json.loads(data)
    ids = [card["id"] for card in cards]
    if not ids or len(ids) != len(set(ids)):
        raise ValueError("The source deck must contain unique, stable card IDs.")
    return cards


def write_package(cards, path):
    deck = genanki.Deck(DECK_ID, "SP Fast-Reload::SR-MPLS")
    model = genanki.Model(
        MODEL_ID,
        "SP Fast-Reload Basic",
        fields=[{"name": "Front"}, {"name": "Back"}],
        templates=[
            {
                "name": "SR-MPLS review",
                "qfmt": "{{Front}}",
                "afmt": '{{FrontSide}}<hr id="answer">{{Back}}',
            },
        ],
        css=".card {font-family: system-ui, sans-serif; font-size: 20px; line-height: 1.5; text-align: left;}",
    )
    expected = {}
    for card in cards:
        fields = [escape(card[key]).replace("\n", "<br>") for key in ("front", "back")]
        guid = genanki.guid_for("sp-fast-reload", "sr-mpls", card["id"])
        tags = ["SR-MPLS", card["subtopic"].replace(" ", "_")]
        deck.add_note(genanki.Note(model=model, fields=fields, tags=tags, guid=guid))
        expected[guid] = "\x1f".join(fields)
    genanki.Package(deck).write_to_file(path)
    return expected


def verify_package(package_path, expected):
    database_path = package_path.with_suffix(".anki2")
    with ZipFile(package_path) as package:
        if package.testzip() is not None or json.loads(package.read("media")) != {}:
            raise ValueError("The Anki package is damaged or has unexpected media.")
        database_path.write_bytes(package.read("collection.anki2"))

    with closing(sqlite3.connect(database_path)) as database:
        integrity = database.execute("PRAGMA integrity_check").fetchone()
        actual = dict(database.execute("SELECT guid, flds FROM notes WHERE mid = ?", (MODEL_ID,)))
        matching_cards = database.execute(
            "SELECT count(*) FROM cards JOIN notes ON cards.nid = notes.id WHERE cards.did = ?",
            (DECK_ID,),
        ).fetchone()[0]
        card_count = database.execute("SELECT count(*) FROM cards").fetchone()[0]
        note_count = database.execute("SELECT count(*) FROM notes").fetchone()[0]
        if integrity != ("ok",) or actual != expected or len(expected) != matching_cards:
            raise ValueError("The packaged Anki database does not match the source flashcards.")
        if card_count != len(expected) or note_count != len(expected):
            raise ValueError("The package has unexpected Anki cards or notes.")


def main():
    cards = load_cards()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with TemporaryDirectory(dir=OUTPUT.parent) as temporary_directory:
        staged_path = Path(temporary_directory) / OUTPUT.name
        expected = write_package(cards, staged_path)
        verify_package(staged_path, expected)
        staged_path.replace(OUTPUT)
    print(f"Verified {len(cards)} cards in {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
