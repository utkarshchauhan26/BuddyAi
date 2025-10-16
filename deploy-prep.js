#!/usr/bin/env node

/**
 * Quick Deployment Script
 * Automates the deployment preparation process
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Friend.io Deployment Preparation\n');

function runCommand(command, description) {
    console.log(`📋 ${description}...`);
    try {
        execSync(command, { stdio: 'inherit', cwd: process.cwd() });
        console.log(`✅ ${description} completed\n`);
        return true;
    } catch (error) {
        console.log(`❌ ${description} failed:`, error.message);
        return false;
    }
}

function createEnvTemplate() {
    console.log('📝 Creating environment template...');
    
    const envTemplate = `# Environment Variables for Friend.io
# Copy this to .env.local for local development
# Set these in your hosting platform for production

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Development Mode (set to false for production)
NEXT_PUBLIC_DEV_MODE=false

# Example:
# NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
`;

    fs.writeFileSync('.env.example', envTemplate);
    console.log('✅ Created .env.example template\n');
}

function checkSupabaseSchema() {
    console.log('📋 Checking Supabase schema...');
    
    if (fs.existsSync('supabase-schema.sql')) {
        const schema = fs.readFileSync('supabase-schema.sql', 'utf8');
        const hasAllTables = ['tasks', 'roadmaps', 'sessions', 'user_stats', 'notes'].every(
            table => schema.includes(`CREATE TABLE IF NOT EXISTS public.${table}`)
        );
        
        if (hasAllTables) {
            console.log('✅ Supabase schema includes all required tables');
            console.log('📋 Remember to run this schema in your Supabase project!\n');
            return true;
        } else {
            console.log('❌ Supabase schema missing some tables\n');
            return false;
        }
    } else {
        console.log('❌ supabase-schema.sql not found\n');
        return false;
    }
}

function generateVercelConfig() {
    console.log('📝 Generating Vercel configuration...');
    
    const vercelConfig = {
        "buildCommand": "npm run build",
        "devCommand": "npm run dev",
        "installCommand": "npm install",
        "framework": "nextjs",
        "functions": {
            "app/api/**/*.ts": {
                "maxDuration": 10
            }
        }
    };
    
    fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
    console.log('✅ Created vercel.json configuration\n');
}

async function main() {
    console.log('Starting deployment preparation...\n');
    
    // Step 1: Create environment template
    createEnvTemplate();
    
    // Step 2: Check Supabase schema
    const schemaOk = checkSupabaseSchema();
    
    // Step 3: Generate Vercel config
    generateVercelConfig();
    
    // Step 4: Run linting
    const lintOk = runCommand('npm run lint', 'Running ESLint');
    
    // Step 5: Run production build
    const buildOk = runCommand('npm run build', 'Creating production build');
    
    // Step 6: Test production build locally
    console.log('🧪 Testing production build...');
    console.log('Run "npm start" to test the production build locally');
    console.log('Visit http://localhost:3000 to verify everything works\n');
    
    // Summary
    console.log('📊 Deployment Preparation Summary:');
    console.log('=' .repeat(50));
    console.log(`✅ Environment template created (.env.example)`);
    console.log(`${schemaOk ? '✅' : '❌'} Supabase schema verified`);
    console.log(`✅ Vercel configuration created`);
    console.log(`${lintOk ? '✅' : '❌'} Linting completed`);
    console.log(`${buildOk ? '✅' : '❌'} Production build completed`);
    
    if (schemaOk && lintOk && buildOk) {
        console.log('\n🎉 All preparation steps completed successfully!');
        console.log('\n🚀 Ready for deployment to Vercel:');
        console.log('1. Push your code to GitHub');
        console.log('2. Connect repository to Vercel');
        console.log('3. Set environment variables in Vercel dashboard:');
        console.log('   - NEXT_PUBLIC_SUPABASE_URL');
        console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
        console.log('   - NEXT_PUBLIC_DEV_MODE=false');
        console.log('4. Deploy!');
        console.log('\n📋 Don\'t forget to run supabase-schema.sql in your Supabase project!');
    } else {
        console.log('\n⚠️ Some steps failed. Please review the errors above.');
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main };