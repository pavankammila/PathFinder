import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add successMsg state
content = content.replace(
    '  const [errorMsg, setErrorMsg] = useState<string | null>(null);',
    '  const [errorMsg, setErrorMsg] = useState<string | null>(null);\n  const [successMsg, setSuccessMsg] = useState<string | null>(null);'
)

# Add showSuccess method near showError
content = content.replace(
    '  const showError = useCallback((msg: string) => {',
    '  const showSuccess = useCallback((msg: string) => {\n    setSuccessMsg(msg);\n    setTimeout(() => setSuccessMsg(null), 3000);\n  }, []);\n\n  const showError = useCallback((msg: string) => {'
)

# Render successMsg
content = content.replace(
    '          {errorMsg && (',
    '          {successMsg && (\n            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-50 text-emerald-600 px-4 py-2 rounded shadow-sm border border-emerald-200 text-[11px] font-medium animate-in fade-in slide-in-from-top-2">\n              {successMsg}\n            </div>\n          )}\n          {errorMsg && ('
)

# Update handleShareGraph to use showSuccess
content = content.replace(
    "      navigator.clipboard.writeText(url.toString());\n      alert('Link copied to clipboard!');\n    } catch (e) {\n      console.error('Failed to share graph', e);\n      alert('Failed to generate share link.');\n    }",
    "      navigator.clipboard.writeText(url.toString());\n      showSuccess('Link copied to clipboard!');\n    } catch (e) {\n      console.error('Failed to share graph', e);\n      showError('Failed to generate share link.');\n    }"
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
