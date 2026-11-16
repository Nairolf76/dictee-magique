// Vite already supplies PostCSS; this plugin adds no dependency.
// Keep the modern declaration immediately after its Safari 15 fallback.
export function legacyValue(value) {
  // Quoted content, comments and URLs are data, not CSS length tokens.
  return value.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\*[\s\S]*?\*\/|url\((?:\\.|[^)])*\)|(?:[+-]?(?:\d*\.\d+|\d+\.?\d*)(?:e[+-]?\d+)?)(?:cqw|dvh)\b/gi, (token, offset, source) => {
    if (!/^[+\-.\d]/.test(token) || (offset > 0 && /[\w.-]/.test(source[offset - 1]))) return token;
    const number = token.slice(0, -3);
    return /cqw$/i.test(token) ? `calc(var(--toy-unit, 4px) * ${number})` : `${number}vh`;
  });
}

export default function cssCompat() {
  return {
    postcssPlugin: 'dictee-safari-15-lengths',
    Once(root) {
      root.walkDecls(declaration => {
        const value = legacyValue(declaration.value);
        if (value === declaration.value) return;
        const previous = declaration.prev();
        if (previous?.type === 'decl' && previous.prop === declaration.prop && previous.value === value && previous.important === declaration.important) return;
        declaration.cloneBefore({value});
      });
    },
  };
}
cssCompat.postcss = true;
