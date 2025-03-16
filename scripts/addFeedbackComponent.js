const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Directory to scan for MDX files
const PAGES_DIR = path.join(__dirname, '..', 'pages');

// Function to get all MDX files recursively
const getMdxFiles = (dir) => {
  const files = [];
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const itemPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      // Skip _meta.ts files and other non-MDX related files
      if (!item.name.startsWith('_') && !item.name.startsWith('.')) {
        files.push(...getMdxFiles(itemPath));
      }
    } else if (item.name.endsWith('.mdx')) {
      files.push(itemPath);
    }
  }
  
  return files;
};

// Calculate the relative path to the components directory
const getRelativeImportPath = (filePath) => {
  // Get the relative directory depth
  const pagesRelativePath = path.relative(PAGES_DIR, path.dirname(filePath));
  const depth = pagesRelativePath.split(path.sep).length;
  
  // Create the correct relative path based on depth
  if (depth === 0) {
    return '../components/PageFeedback';
  }
  
  // For each level of depth, add another ../ to go up
  return '../'.repeat(depth) + '../components/PageFeedback';
};

// Function to add PageFeedback component if it doesn't exist
const addPageFeedbackToFile = async (filePath) => {
  try {
    // Read file content
    const content = await readFile(filePath, 'utf8');
    
    // Check if PageFeedback is already imported
    if (content.includes('import PageFeedback') || content.includes('<PageFeedback')) {
      console.log(`✅ PageFeedback already exists in ${filePath}`);
      return;
    }
    
    // Get relative path for the component
    // Extract the relative path from the pages directory
    const relativePath = filePath.replace(PAGES_DIR, '').replace(/\\/g, '/');
    const pagePath = relativePath.replace('.mdx', '');
    
    // Get the correct relative import path
    const importPath = getRelativeImportPath(filePath);
    
    // Prepare the import statement and component usage
    const importStatement = `import PageFeedback from '${importPath}'\n\n`;
    const componentUsage = `\n\n<PageFeedback path="${pagePath}" />\n`;
    
    // Add import at the beginning and component at the end
    const updatedContent = importStatement + content + componentUsage;
    
    // Write the updated content back to the file
    await writeFile(filePath, updatedContent, 'utf8');
    
    console.log(`✅ Added PageFeedback to ${filePath}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
};

// Main function
const main = async () => {
  console.log('🔍 Scanning for MDX files...');
  const mdxFiles = getMdxFiles(PAGES_DIR);
  console.log(`📝 Found ${mdxFiles.length} MDX files`);
  
  // Process each file
  let added = 0;
  let skipped = 0;
  
  for (const file of mdxFiles) {
    const contentBefore = await readFile(file, 'utf8');
    await addPageFeedbackToFile(file);
    const contentAfter = await readFile(file, 'utf8');
    
    if (contentBefore !== contentAfter) {
      added++;
    } else if (contentBefore.includes('<PageFeedback')) {
      skipped++;
    }
  }
  
  console.log(`✨ Done! Added PageFeedback to ${added} files, ${skipped} files already had it.`);
};

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 