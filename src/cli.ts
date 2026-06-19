#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { BookConfig } from './BookConfig';
import { BookCompiler } from './BookCompiler';
import { BookConfigData } from './types';

const args = process.argv.slice(2);
const command = args[0];

if (!command || command === 'help' || command === '--help' || command === '-h') {
  showHelp();
  process.exit(0);
}

switch (command) {
  case 'init':
    handleInit();
    break;
  case 'build':
    handleBuild();
    break;
  default:
    handleBuild(command);
    break;
}

function showHelp(): void {
  console.log(`
Bitig - OOP Book Compiler CLI (TS)

Usage:
  bitig <command> [options]

Commands:
  init                  Creates a template book.json and assets folder in the current directory.
  build [configPath]    Compiles the book. [configPath] defaults to 'book.json'.
  help                  Displays this help menu.

Examples:
  bitig init
  bitig build
  bitig build ./custom-book.json
`);
}

function handleInit(): void {
  const currentDir = process.cwd();
  const configPath = path.join(currentDir, 'book.json');

  if (fs.existsSync(configPath)) {
    console.error('Error: A book.json file already exists in this directory!');
    process.exit(1);
  }

  const templateConfig: BookConfigData = {
    title: "New Book Title",
    subtitle: "Book Subtitle",
    author: "Author Name",
    description: "A brief description/summary of the book.",
    theme: "serif",
    assetsDir: "./assets",
    distDir: "./dist",
    outputFilename: "book.md",
    epilogueFile: "epilogue.md",
    bibliographyFile: "bibliography.md",
    sectionTitles: {
      "0": "Introduction and Preface",
      "1": "Chapter 1: Foundations",
      "2": "Chapter 2: Deep Dive",
      "998": "Epilogue",
      "999": "Bibliography"
    },
    citations: [
      {
        term: "quantum entanglement",
        replacement: "quantum entanglement<sup>[1]</sup>"
      }
    ]
  };

  try {
    // Write book.json
    fs.writeFileSync(configPath, JSON.stringify(templateConfig, null, 2), 'utf8');
    console.log('✔ book.json created.');

    // Create folders
    const assetsDir = path.join(currentDir, 'assets');
    const section0Dir = path.join(assetsDir, 'section-0');
    const section1Dir = path.join(assetsDir, 'section-1');

    fs.mkdirSync(section0Dir, { recursive: true });
    fs.mkdirSync(section1Dir, { recursive: true });

    // Write sample chapters
    fs.writeFileSync(
      path.join(section0Dir, '0.1.md'),
      `# Introduction and Preface\n\nThis book was created using Bitig. This is the preface or introduction section.`,
      'utf8'
    );
    fs.writeFileSync(
      path.join(section1Dir, '1.1.md'),
      `# Foundations and the World\n\nQuantum entanglement is one of the deepest secrets of the universe. This is the first chapter.`,
      'utf8'
    );
    fs.writeFileSync(
      path.join(assetsDir, 'epilogue.md'),
      `# Epilogue\n\nThis book concludes with the epilogue.`,
      'utf8'
    );
    fs.writeFileSync(
      path.join(assetsDir, 'bibliography.md'),
      `# Bibliography\n\n[1] Penrose, R. (1989). The Emperor's New Mind.`,
      'utf8'
    );

    console.log('✔ Sample chapter directories and markdown files (assets/) created.');
    console.log('\nSuccess! To compile the book, run:');
    console.log('  bitig build');
  } catch (error) {
    const err = error as Error;
    console.error('Error: An error occurred while creating the template:', err.message);
    process.exit(1);
  }
}

async function handleBuild(configArg?: string): Promise<void> {
  const currentDir = process.cwd();
  const configPath = configArg ? path.resolve(configArg) : path.join(currentDir, 'book.json');

  if (!fs.existsSync(configPath)) {
    console.error(`Error: Configuration file not found at: ${configPath}`);
    console.log('Use "bitig init" to initialize a new project.');
    process.exit(1);
  }

  try {
    console.log(`📖 Loading configuration: ${configPath}`);
    const config = BookConfig.loadFromFile(configPath);
    
    const compiler = new BookCompiler(config);
    
    console.log('🔍 Scanning source files...');
    compiler.scanAndLoad();
    
    console.log('⚙ Compiling book...');
    await compiler.writeOutputs();
    
    console.log('✔ Book and AI metadata successfully compiled!');
  } catch (error) {
    const err = error as Error;
    console.error('❌ Compilation Failed:', err.message);
    process.exit(1);
  }
}
