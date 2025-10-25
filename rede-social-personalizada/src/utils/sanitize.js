// src/utils/sanitize.js
import DOMPurify from 'dompurify'
export const sanitize = (html) => DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
