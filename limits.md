# Groq API Limits — Llama 4 Scout (`meta-llama/llama-4-scout-17b-16e-instruct`)

## Model Overview

| Property               | Value                                   |
|------------------------|-----------------------------------------|
| **Model**              | `meta-llama/llama-4-scout-17b-16e-instruct` |
| **Architecture**       | 17B params, Mixture-of-Experts (16 experts) |
| **Type**               | Multimodal (text + vision)              |
| **Max Context Window** | 131,072 tokens (128K)                   |
| **Max Output Tokens**  | 8,192 tokens                            |

---

## Rate Limits (Free Tier)

| Metric                    | Limit                    |
|---------------------------|--------------------------|
| **Requests Per Minute**   | ~30 RPM                  |
| **Requests Per Day**      | ~1,000 RPD               |
| **Tokens Per Minute**     | ~30,000 TPM              |
| **Tokens Per Day**        | Varies (check Groq Console) |

> **Note:** Exceeding limits returns a `429 Too Many Requests` error. No charges on the free tier.  
> Check your exact limits at: [Groq Console → Settings → Limits](https://console.groq.com/)

---

## Image/Vision Limits

| Constraint                      | Limit                 |
|---------------------------------|-----------------------|
| **Max images per request**      | **5 images**          |
| **Max image resolution**        | 33 megapixels (33,177,600 total pixels) |
| **Max base64 image size**       | 4 MB per image        |
| **Max URL image size**          | 20 MB per image       |

---

## Pricing (Paid Tier / Developer Plan)

| Metric            | Cost                           |
|-------------------|--------------------------------|
| **Input tokens**  | $0.11 per 1M tokens            |
| **Output tokens** | $0.34 per 1M tokens            |

---

## Key Constraints for This Project

1. **5 images max** — This is why we stitch multiple PDF pages into composite images (QP: 2 images, AS: 2-3 images, Model Answer: 1 image).
2. **4 MB per image** — Large PDFs with many pages may produce oversized composite images. JPEG compression at 75% quality helps.
3. **8,192 max output tokens** — Long evaluation reports (many questions) may get truncated.
4. **30 RPM** — Can handle moderate usage but not rapid repeated evaluations.
5. **No PDF support** — Unlike Gemini, Groq doesn't accept PDFs directly. PDFs must be converted to images first.
