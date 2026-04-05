# Urdu Text Tokenization API

Flask-based REST API for tokenizing Urdu text from CSV files.

## Features

- **Urdu tokenization** using rule-based regex patterns (supports Urdu/Arabic Unicode ranges)
- **CSV processing**: Upload a CSV file with Urdu text and receive tokenized output
- **Automatic fallbacks**: Attempts to use spaCy model if available, falls back to regex-based tokenizer
- **CORS enabled** for cross-origin requests

## Installation

1. Create and activate a virtual environment:
```powershell
python -m venv .venv
& .venv\Scripts\Activate.ps1
```

2. Install dependencies:
```powershell
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

## Usage

### Start the Server

```powershell
python app.py
```

The server will start on `http://localhost:5000`

### API Endpoint

**POST** `/tokenize`

Upload a CSV file with a `comment` column containing Urdu text. Returns a CSV with an additional `tokens` column.

#### Example using cURL:

```powershell
curl -X POST -F "file=@input.csv" http://localhost:5000/tokenize --output tokenized_output.csv
```

#### Example using Python:

```python
import requests

with open('input.csv', 'rb') as f:
    response = requests.post('http://localhost:5000/tokenize', files={'file': f})
    
with open('output.csv', 'wb') as f:
    f.write(response.content)
```

### Input CSV Format

Your CSV must have a `comment` column:

```csv
id,comment
1,یہ پہلا تبصرہ ہے۔
2,دوسرا تبصرہ بہت اچھا ہے!
3,تیسرا تبصرہ 123 نمبر کے ساتھ۔
```

### Output CSV Format

Returns the same CSV with an added `tokens` column:

```csv
id,comment,tokens
1,یہ پہلا تبصرہ ہے۔,"['یہ', 'پہلا', 'تبصرہ', 'ہے۔']"
2,دوسرا تبصرہ بہت اچھا ہے!,"['دوسرا', 'تبصرہ', 'بہت', 'اچھا', 'ہے', '!']"
3,تیسرا تبصرہ 123 نمبر کے ساتھ۔,"['تیسرا', 'تبصرہ', '123', 'نمبر', 'کے', 'ساتھ۔']"
```

## Testing

Run the test script to verify tokenization:

```powershell
python test_tokenize.py
```

This will test:
- Individual Urdu text tokenization
- CSV processing workflow
- Token count and breakdown

## Tokenization Details

The tokenizer uses regex patterns to identify:
- **Urdu/Arabic script**: Unicode ranges U+0600–U+06FF, U+0750–U+077F, U+08A0–U+08FF
- **ASCII words**: A-Z, a-z
- **Numbers**: 0-9
- **Punctuation**: Individual non-whitespace characters

### Pattern
```regex
[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]+|[A-Za-z]+|\d+|[^\s]
```

## Notes

- The app attempts to use the spaCy model `ur_core_news_sm` if available, but this model is not currently compatible with spaCy v3.8.9
- The regex-based fallback provides reliable tokenization for most Urdu text
- Output encoding is UTF-8 with BOM (`utf-8-sig`) for Excel compatibility

## Dependencies

- flask
- flask-cors
- pandas
- spacy

See `requirements.txt` for details.
