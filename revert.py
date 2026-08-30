import re

def revert_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(filepath, 'w') as f:
        f.write(content)

# src/App.tsx
app_replacements = [
    # root wrapper
    (
        'className="flex flex-col min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors font-sans lg:h-screen lg:overflow-hidden select-none selection:bg-zinc-200 dark:selection:bg-zinc-700"',
        'className="flex flex-col h-screen w-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors font-sans overflow-hidden select-none selection:bg-zinc-200 dark:selection:bg-zinc-700"'
    ),
    # middle container
    (
        '<div className="flex flex-col lg:flex-row flex-1 lg:overflow-hidden">',
        '<div className="flex flex-1 overflow-hidden">'
    ),
    # left sidebar
    (
        'className={`w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 lg:overflow-y-auto order-2 lg:order-none ${!isLeftSidebarOpen ? "hidden lg:hidden" : ""} max-lg:!flex`}',
        'className={`w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 overflow-y-auto ${!isLeftSidebarOpen ? \'hidden\' : \'\'}`}'
    ),
    # right sidebar
    (
        'className={`w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 lg:overflow-y-auto order-3 lg:order-none ${!isRightSidebarOpen ? "hidden lg:hidden" : ""} max-lg:!flex`}',
        'className={`w-80 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 overflow-y-auto ${!isRightSidebarOpen ? \'hidden\' : \'\'}`}'
    ),
    # hide toggle buttons left
    (
        'className="hidden lg:block absolute top-4 left-4 z-20 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none"',
        'className="absolute top-4 left-4 z-20 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 focus-visible:outline-none"'
    ),
    # main height
    (
        '<main className="flex-1 flex flex-col min-w-0 bg-zinc-100 dark:bg-zinc-800 relative order-1 lg:order-none min-h-[400px] max-h-[50vh] lg:max-h-none lg:min-h-0">',
        '<main className="flex-1 flex flex-col min-w-0 bg-zinc-100 dark:bg-zinc-800 relative">'
    ),
    # trace footer
    (
        '<div className="border border-zinc-200 dark:border-zinc-800 rounded overflow-x-auto">',
        '<div className="border border-zinc-200 dark:border-zinc-800 rounded overflow-hidden">'
    ),
    (
        '<table className="w-full text-left text-[10px] min-w-[200px]">\n                    <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">',
        '<table className="w-full text-left text-[10px]">\n                    <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">'
    ),
    (
        '<footer className="h-auto lg:h-32 min-h-[128px] border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0">',
        '<footer className="h-32 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0">'
    ),
    (
        '<div className="flex-1 flex flex-col font-mono text-[10px] bg-zinc-50 dark:bg-zinc-950/30 overflow-visible lg:overflow-y-auto p-2 space-y-1">',
        '<div className="flex-1 flex flex-col font-mono text-[10px] bg-zinc-50 dark:bg-zinc-950/30 overflow-y-auto p-2 space-y-1">'
    ),
    # header wrap
    (
        '<header className="min-h-[48px] py-2 lg:py-0 lg:h-12 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-wrap lg:flex-nowrap items-center justify-between px-4 gap-2 shrink-0 z-50">',
        '<header className="h-12 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-4 shrink-0 z-50">'
    ),
    (
        '<div className="flex flex-wrap items-center gap-2 lg:gap-6 justify-center w-full lg:w-auto order-3 lg:order-none mt-2 lg:mt-0">',
        '<div className="flex items-center gap-6">'
    )
]

revert_file('src/App.tsx', app_replacements)

# src/components/CameraModal.tsx
camera_replacements = [
    (
        '<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 lg:p-8 overflow-y-auto">',
        '<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-8">'
    ),
    (
        '<div className="bg-white dark:bg-zinc-900 sm:rounded-lg shadow-xl w-full h-full max-w-6xl overflow-hidden flex flex-col">',
        '<div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full h-full max-w-6xl overflow-hidden">'
    ),
    (
        '<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">',
        '<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">'
    ),
    (
        '<div className="bg-white dark:bg-zinc-900 sm:rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col">',
        '<div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col">'
    )
]
revert_file('src/components/CameraModal.tsx', camera_replacements)

# src/components/AITutorPanel.tsx
ai_replacements = [
    (
        'className={`fixed right-0 top-0 bottom-0 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-xl z-50 flex flex-col transition-all duration-300 ease-in-out ${isExpanded ? "w-full sm:w-[600px] max-w-[90vw]" : "w-full sm:w-[350px]"}`}',
        'className={`fixed right-0 top-0 bottom-0 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-xl z-50 flex flex-col transition-all duration-300 ease-in-out ${isExpanded ? \'w-[600px] max-w-[90vw]\' : \'w-[350px]\'}`}'
    )
]
revert_file('src/components/AITutorPanel.tsx', ai_replacements)

# src/index.css
css_replacements = [
    (
        'body {\n    @apply font-sans text-primary bg-canvas m-0 p-0;\n  }',
        'body {\n    @apply font-sans text-primary bg-canvas overflow-hidden m-0 p-0 h-screen w-screen;\n  }'
    )
]
revert_file('src/index.css', css_replacements)

# src/components/camera/ReviewScreen.tsx
review_replacements = [
    (
        '<div className="flex flex-col lg:flex-row flex-1 lg:min-h-0 overflow-y-auto lg:overflow-hidden">',
        '<div className="flex flex-1 min-h-0">'
    ),
    (
        '<div className="w-full lg:w-1/2 h-[30vh] lg:h-auto p-4 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center relative overflow-hidden shrink-0">',
        '<div className="w-1/2 p-4 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center relative overflow-hidden">'
    ),
    (
        '<div className="w-full lg:w-1/2 bg-white dark:bg-zinc-900 flex flex-col relative min-h-[400px] lg:min-h-0 shrink-0">',
        '<div className="w-1/2 bg-white dark:bg-zinc-900 flex flex-col relative">'
    )
]
revert_file('src/components/camera/ReviewScreen.tsx', review_replacements)

