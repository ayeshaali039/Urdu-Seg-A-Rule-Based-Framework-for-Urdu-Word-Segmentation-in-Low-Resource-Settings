# Install: pip install flask flask-cors pandas spacy
from flask import Flask, request, send_file
from flask_cors import CORS
import pandas as pd
import spacy
import io
import re
import unicodedata
from spacy.tokenizer import Tokenizer
from spacy.util import compile_prefix_regex, compile_suffix_regex, compile_infix_regex
from spacy.symbols import ORTH

app = Flask(__name__)
CORS(app)

# ===============================
# Initialize spaCy Urdu Tokenizer
# ===============================
nlp = spacy.blank("ur")
print("Initialized spaCy blank Urdu pipeline")


# ===============================
# Rule 2: Prefix Recognition
# ===============================
urdu_prefixes = ["بے", "نا", "بد", "لا"]

prefix_patterns = list(nlp.Defaults.prefixes) + [
    r"^" + p for p in urdu_prefixes
]

prefix_regex = compile_prefix_regex(prefix_patterns)


# ===============================
# Rule 3: Suffix / Clitic Separation
# ===============================
urdu_suffixes = ["کو", "سے", "نے", "تک", "ہی", "بھی"]

suffix_patterns = list(nlp.Defaults.suffixes) + [
    r"" + s + r"$" for s in urdu_suffixes
]

suffix_regex = compile_suffix_regex(suffix_patterns)


# ===============================
# Rule 5: Infix / Punctuation Handling
# ===============================
urdu_punct = [r"[،۔!?؛]"]

infix_patterns = list(nlp.Defaults.infixes) + urdu_punct

infix_regex = compile_infix_regex(infix_patterns)


# ===============================
# Create Custom Tokenizer
# ===============================
nlp.tokenizer = Tokenizer(
    nlp.vocab,
    prefix_search=prefix_regex.search,
    suffix_search=suffix_regex.search,
    infix_finditer=infix_regex.finditer,
)


# ===============================
# Rule 4: Compound & Named Entity Preservation
# ===============================
compound_phrases = [
    "وزیراعظم پاکستان",
    "اسلام آباد",
    "سپریم کورٹ",
    "اہل خانہ"
]

for phrase in compound_phrases:
    nlp.tokenizer.add_special_case(
        phrase,
        [{ORTH: phrase}]
    )


# ===============================
# Rule 1: Urdu-only Script + Unicode Normalization
# ===============================
def normalize_urdu(text):
    """Normalize text to keep only Urdu script characters."""
    text = unicodedata.normalize("NFC", str(text))
    text = re.sub(r"[^\u0600-\u06FF\s]", " ", text)  # Keep only Urdu script
    text = re.sub(r"\s+", " ", text).strip()
    return text


def tokenize_text(text):
    """Tokenize Urdu text using custom spaCy tokenizer with all rules applied."""
    text = normalize_urdu(text)  # Apply Rule 1
    doc = nlp(text)              # Apply Rules 2–5
    return [token.text for token in doc]


@app.route('/tokenize', methods=['POST'])
def tokenize():
    file = request.files['file']
    data = pd.read_csv(file)

    data["tokens"] = data["comment"].apply(tokenize_text)

    output = io.BytesIO()
    data.to_csv(output, index=False, encoding='utf-8-sig')
    output.seek(0)

    return send_file(output, mimetype='text/csv',
                     as_attachment=True,
                     download_name='tokenized_output.csv')


if __name__ == '__main__':
    app.run(debug=True, port=5000)
