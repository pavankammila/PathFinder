import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_end = """      />
    </div>
  );
}"""

new_end = """      />
      <AITutorPanel
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        buildContext={buildTutorContext}
        externalQuery={tutorQuery}
        onExternalQueryHandled={() => setTutorQuery(undefined)}
      />
    </div>
  );
}"""

content = content.replace(old_end, new_end)

with open(filepath, 'w') as f:
    f.write(content)
