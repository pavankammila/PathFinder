import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

imports = """import { runDijkstra, runFloydWarshall, algorithmMetadata } from './algorithms';"""
new_imports = """
import { AlgorithmMetadata, algorithmMetadata } from './algorithms/metadata';
import { validateAlgorithmRequirements } from './algorithms/validation';
import * as algos from './algorithms';
import { CompareAlgorithmsModal } from './components/CompareAlgorithmsModal';
"""

content = content.replace(imports, new_imports)

with open('src/App.tsx', 'w') as f:
    f.write(content)
