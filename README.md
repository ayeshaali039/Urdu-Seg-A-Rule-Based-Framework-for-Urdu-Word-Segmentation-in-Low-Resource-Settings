# Urdu-Seg

**A rule-based word segmenter and benchmark for noisy Urdu social media text**

This repository contains the code, data and results for the paper:

> Rashid, A.; Mahmood, S.; Choudhary, R. *Urdu-Seg: A Rule-Based Word Segmenter and Benchmark for Noisy Urdu Social Media Text.* Submitted to *AI* (MDPI), 2026.

Urdu is often written with missing or extra spaces, and many words are written together or broken apart. Urdu-Seg fixes the most frequent of these problems with six ordered rules. It needs no annotated training data and works as a drop-in spaCy tokenizer.

| System | Boundary F1, independent test set (341 comments) | Boundary F1, original noisy comments (3280) |
|---|---|---|
| **Urdu-Seg** (no training data) | **0.9900** | **0.9933** |
| CRF (trained on ~2800 annotated comments) | 0.9911 | 0.9935 |
| Best general-purpose toolkit | 0.9804 (Stanza) | 0.9710 (spaCy) |
| Whitespace splitting | 0.9803 | 0.9415 |

Urdu-Seg and the CRF are not significantly different (paired bootstrap, p ≥ 0.36 on every test set).

---

## Quick start

The core segmenter is a single Python file with no dependencies.

```python
import sys; sys.path.insert(0, "src")
from urduseg import load_default

seg = load_default()
print(seg.tokenize("عمران خان نے کہاکہ وہ کل اسلام آباد جائیںگے"))
```

Use it as the tokenizer of a spaCy pipeline:

```python
import spacy
from urduseg import load_default, make_spacy_tokenizer

nlp = spacy.blank("ur")
nlp.tokenizer = make_spacy_tokenizer(nlp, load_default())
print([t.text for t in nlp("آپکو یہ بات پتہ ہوگی")])
```

Each rule can be switched off, for example `load_default(mwe=False, split_fused=False)`.
The available flags are listed in `UrduSegConfig` in `src/urduseg.py`.

From the command line:

```bash
echo "یہ کام ہوگیا" | python src/urduseg.py
```

## Reproducing the paper

```bash
pip install -r requirements.txt
python reproduce.py
```

`reproduce.py` takes under a minute. It:

1. re-runs Urdu-Seg, the whitespace baseline and the six ablations on both corpora and checks that the output is identical to the prediction files in `results/`;
2. scores every system on the three test sets and writes the numbers behind Tables 4–7 and 11 to `results/final/`.

The toolkit baselines and the CRF are scored from their shipped prediction files. To regenerate those as well:

| Notebook | What it does | Time |
|---|---|---|
| `notebook/run_baselines.ipynb` | spaCy, NLTK, Stanza and Indic NLP predictions, and the runtimes in Table 8 | ~10 min |
| `notebook/run_crf.ipynb` | Five-fold cross-validated CRF (clean and noisy), Table 11 | 10–30 min |

Runtimes depend on the hardware. The paper's measurements were made with Python 3.9, spaCy 3.7.2, NLTK 3.9.2 and Stanza 1.11.0 on a Windows 10 laptop with an Intel CPU and 8 GB of RAM.

## Repository layout

```
src/
  urduseg.py              the segmenter (pure Python) and make_spacy_tokenizer()
  resources/
    lexicon.tsv           word frequencies from the unlabeled corpus (no gold labels used)
    mwe_gazetteer.txt     104 multi-word units (formulae, acronyms, places, names, compounds)
  evaluate.py             boundary P/R/F1, token F1, exact match, bootstrap CIs, paired bootstrap test
  predict.py              runs Urdu-Seg, whitespace and ablations over a corpus file
  crf_baseline.py         character-level CRF with five-fold cross-validation
  build_gold_v2.py        double-annotated subset: agreement (Cohen's kappa) and adjudication
  build_gold_v3.py        final gold standard: deduplication and dev/test split
  make_noisy_gold.py      projects the clean gold onto the original noisy comments
  annotation_tools/       scripts used during annotation (see below)
data/
  inputs/                 the corpus and the two annotators' independent annotations
  v2/                     double-annotated subset (471 comments) and agreement statistics
  v3/                     the final benchmark
notebook/                 baseline and CRF notebooks
results/
  clean/, noisy/          predictions of every system on every comment
  crf/                    CRF predictions and per-fold training information
  final/                  metrics written by reproduce.py
  timing.json             runtimes behind Table 8
docs/
  annotation_guideline.md the segmentation guideline given to the annotators
reproduce.py
```

## The benchmark

All CSV files are UTF-8 with a byte-order mark, so Excel displays Urdu correctly. Token lists are stored as JSON arrays. A multi-word unit is one token with a space inside it, for example `"عمران خان"`.

| File | Rows | Contents |
|---|---|---|
| `data/v3/gold_v3.csv` | 4810 | **Main gold standard** (clean text). Columns: `id`, `split`, `source`, `text`, `noisy`, `tokens` |
| `data/v3/gold_v3_noisy.csv` | 4673 | The same gold segmentation projected onto the original noisy comments |
| `data/v3/v2dedup_revised.csv` | 471 | Independent double-annotated set (the primary test set of Table 4) |
| `data/v3/v2dedup_original.csv` | 471 | The same set with the annotators' original decisions, before the 27 guideline revisions |
| `data/v2/dev_ids.txt` | 100 | The development set. All rules and thresholds were set on these comments only. |

**Splits.** `dev` holds the 100 development comments. `test` holds one copy of each distinct comment text, with no text that also occurs in `dev`. `test_duplicate` marks further copies of a test comment; they are kept for completeness but never scored. Always evaluate with `--split test`.

**Sources** (`source` column of `gold_v3.csv`):

- `double-annotated`: annotated independently by two annotators without any pre-annotation; disagreements adjudicated (471 comments, κ = 0.989 on decision points).
- `double-annotated (revised)`: 27 of these, updated to the final guideline and verified by an annotator.
- `single-annotated (annotator 1 / 2)`: the remaining 4339 comments, pre-annotated with Urdu-Seg's output and corrected by one annotator.

Because most of the test data was pre-annotated with Urdu-Seg, the paper treats the independent set as the primary test set and measures the pre-annotation bias on 100 hidden control comments (Section 6.6). The ids of those comments are listed in `data/v3/bias_check_ids.csv`, and their pre-annotated versions are in `data/v3/new_annotations.csv`.

**Noisy version.** `noisy` is the comment as originally posted, and `text` is the cleaned version (punctuation and emoji removed). In the noisy gold, each punctuation mark, emoji and URL is its own token, a run of the same mark (`!!!`) is one token, and `#` and `@` are separated from the following word.

**Corpus.** The comments were collected from Facebook, Twitter and YouTube and were used earlier for Urdu toxicity detection (Rashid et al., *AI* 2025, 6, 194). Some comments are offensive.

## Annotation tools

`src/annotation_tools/` documents how the benchmark was annotated. These scripts are not needed to reproduce the results.

- `make_annotation_batches.py` writes the Excel batches with the Urdu-Seg pre-annotation and hides the bias-check comments among them.
- `make_adjudication_xlsx.py` writes the adjudication sheet for the double-annotated subset.
- `audit_batches.py` contains the consistency checks that proposed corrections to the returned batches. Every proposal was checked by an annotator before it was accepted.
- `manual_fixes.json` lists the hand-checked corrections for Arabic and Quranic passages that were typed letter by letter.

## Known limitations

- Two errors of the fused-verb rule are reported in the paper and deliberately left unfixed, because fixing them after seeing the test data would be tuning on the test set: `آلو` → `آ | لو` and `آگے` → `آ | گے`.
- The pronoun + postposition rule (`آپکو` → `آپ | کو`) exists but is off by default (`split_clitic=False`). The double-annotated development data kept these forms together.
- The gazetteer covers the domain of this corpus (news, politics, religion). For other text, extend `src/resources/mwe_gazetteer.txt`.

## Citation

```bibtex
@article{rashid2026urduseg,
  title   = {Urdu-Seg: A Rule-Based Word Segmenter and Benchmark for Noisy Urdu Social Media Text},
  author  = {Rashid, Ayesha and Mahmood, Sajid and Choudhary, Reema},
  journal = {AI},
  year    = {2026},
  note    = {Under review}
}
```

## License

The code is released under the MIT License (`LICENSE`). The benchmark data is released under CC BY 4.0 (`data/LICENSE`) for research use. Some comments may contain offensive language.

## Contact

Ayesha Rashid, University of Management and Technology, Lahore: f2019288010@umt.edu.pk
