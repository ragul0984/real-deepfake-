import re
import requests
import tldextract
from bs4 import BeautifulSoup


SUSPICIOUS_TLDS = {
    "xyz", "top", "tk", "ml", "ga", "cf", "gq", "icu", "click"
}

URL_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "ow.ly"
}


def analyze_link_forensics(url):
    score = 0
    reasons = []

    url = url.replace("[.]", ".")
    url = url.replace("(.)", ".")
    url = url.replace("hxxp://", "http://").replace("hxxps://", "https://")

    # --------------------------------
    # 1. URL structure analysis
    # --------------------------------
    if len(url) > 80:
        score += 15
        reasons.append({
            "title": "Unusually Long URL",
            "score": 70,
            "description": "Long URLs are often used to obscure malicious intent."
        })

    if re.search(r"@|%|=", url):
        score += 15
        reasons.append({
            "title": "Obfuscated URL Characters",
            "score": 75,
            "description": "Suspicious characters are commonly used in phishing links."
        })

    # --------------------------------
    # 2. Domain analysis
    # --------------------------------
    ext = tldextract.extract(url)
    domain = f"{ext.domain}.{ext.suffix}"

    # Hyphen-stuffed domain detection
    if ext.domain.count("-") >= 2:
        score += 30
        reasons.append({
            "title": "Deceptive Domain Structure",
            "score": 90,
            "description": "The domain uses excessive hyphens, a common phishing tactic."
        })

    # Fake security keywords in domain
    security_keywords = ["login", "secure", "verify", "account", "auth", "update"]
    if any(k in ext.domain.lower() for k in security_keywords):
        score += 25
        reasons.append({
            "title": "Impersonation Keywords in Domain",
            "score": 85,
            "description": "The domain name mimics authentication or security-related services."
        })


    if ext.suffix in SUSPICIOUS_TLDS:
        score += 25
        reasons.append({
            "title": "Low-Reputation Domain",
            "score": 85,
            "description": "The domain extension is commonly associated with scam websites."
        })

    if domain in URL_SHORTENERS:
        score += 20
        reasons.append({
            "title": "URL Shortener Used",
            "score": 80,
            "description": "Shortened links often hide the final destination."
        })

    # --------------------------------
    # 3. Redirect behavior
    # --------------------------------
    try:
        response = requests.get(url, timeout=6, allow_redirects=True)

        if len(response.history) > 2:
            score += 20
            reasons.append({
                "title": "Multiple Redirects Detected",
                "score": 80,
                "description": "Multiple redirects are commonly used in malicious campaigns."
            })

        content = response.text.lower()

        # --------------------------------
        # 4. Social engineering cues
        # --------------------------------
        triggers = [
            "verify your account",
            "urgent action required",
            "click immediately",
            "suspended",
            "confirm identity",
            "limited time"
        ]

        matched = [t for t in triggers if t in content]

        if matched:
            score += 25
            reasons.append({
                "title": "Social Engineering Language",
                "score": 90,
                "description": "The page uses urgency and fear-based phrases to manipulate users."
            })

    except Exception:
        score += 10
        reasons.append({
            "title": "Unreachable or Unstable Link",
            "score": 60,
            "description": "The link could not be reliably accessed."
        })

    # --------------------------------
    # FINAL DECISION
    # --------------------------------
    if score >= 50:
        verdict = "Likely Fake"
        confidence = min(95, score)

    elif score >= 30:
        verdict = "Suspicious"
        confidence = min(85, score + 20)

    else:
        verdict = "Real"
        confidence = max(70, 100 - score)

    return verdict, confidence, reasons
