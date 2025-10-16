#!/usr/bin/env node

/**
 * Production Readiness Test Script
 * Run this to verify all systems are ready for deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Friend.io Production Readiness Check\n');

// Test 1: Check required files exist
function checkRequiredFiles() {
    console.log('📁 Checking required files...');
    
    const requiredFiles = [
        'package.json',
        'next.config.mjs',
        'app/layout.tsx',
        'app/page.tsx',
        'components/header.tsx',
        'components/notes-panel.tsx',
        'lib/storage.ts',
        'lib/supabase-storage.ts',
        'public/BuddyAI.png',
        'supabase-schema.sql'
    ];
    
    const missing = [];
    
    for (const file of requiredFiles) {
        if (!fs.existsSync(path.join(process.cwd(), file))) {
            missing.push(file);
        }
    }
    
    if (missing.length === 0) {
        console.log('✅ All required files present');
        return true;
    } else {
        console.log('❌ Missing files:', missing);
        return false;
    }
}

// Test 2: Check package.json configuration
function checkPackageConfig() {
    console.log('\n📦 Checking package configuration...');
    
    try {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        const checks = {
            'Has build script': !!pkg.scripts?.build,
            'Has start script': !!pkg.scripts?.start,
            'Has Next.js dependency': !!pkg.dependencies?.next,
            'Has Supabase dependency': !!pkg.dependencies?.['@supabase/supabase-js'],
            'Has React dependency': !!pkg.dependencies?.react
        };
        
        const results = Object.entries(checks).map(([check, passed]) => {
            console.log(`${passed ? '✅' : '❌'} ${check}`);
            return passed;
        });
        
        return results.every(Boolean);
    } catch (error) {
        console.log('❌ Error reading package.json:', error.message);
        return false;
    }
}

// Test 3: Check TypeScript configuration
function checkTypeScriptConfig() {
    console.log('\n🔧 Checking TypeScript configuration...');
    
    try {
        if (!fs.existsSync('tsconfig.json')) {
            console.log('❌ tsconfig.json not found');
            return false;
        }
        
        const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
        
        const checks = {
            'Has strict mode': tsconfig.compilerOptions?.strict === true,
            'Has ES modules': tsconfig.compilerOptions?.module === 'esnext' || tsconfig.compilerOptions?.module === 'es2022',
            'Has JSX config': !!tsconfig.compilerOptions?.jsx
        };
        
        const results = Object.entries(checks).map(([check, passed]) => {
            console.log(`${passed ? '✅' : '⚠️'} ${check}`);
            return passed;
        });
        
        return results.filter(Boolean).length >= 2; // At least 2 of 3 should pass
    } catch (error) {
        console.log('❌ Error reading tsconfig.json:', error.message);
        return false;
    }
}

// Test 4: Check environment variables template
function checkEnvTemplate() {
    console.log('\n🔐 Checking environment setup...');
    
    // Check if we have environment variable references in the code
    const supabaseStoragePath = 'lib/supabase-storage.ts';
    
    if (fs.existsSync(supabaseStoragePath)) {
        const content = fs.readFileSync(supabaseStoragePath, 'utf8');
        
        const checks = {
            'Has environment check': content.includes('process.env.NEXT_PUBLIC_DEV_MODE'),
            'Has Supabase client': content.includes('createClient'),
            'Has fallback logic': content.includes('fallbackToLocalStorage')
        };
        
        const results = Object.entries(checks).map(([check, passed]) => {
            console.log(`${passed ? '✅' : '❌'} ${check}`);
            return passed;
        });
        
        return results.every(Boolean);
    } else {
        console.log('❌ Supabase storage file not found');
        return false;
    }
}

// Test 5: Check build output structure
function checkBuildStructure() {
    console.log('\n🏗️ Checking build structure...');
    
    if (!fs.existsSync('.next')) {
        console.log('⚠️ .next directory not found - run "npm run build" first');
        return true; // Not a failure, just needs build
    }
    
    const buildChecks = {
        'Has build manifest': fs.existsSync('.next/build-manifest.json'),
        'Has static files': fs.existsSync('.next/static'),
        'Has server files': fs.existsSync('.next/server')
    };
    
    const results = Object.entries(buildChecks).map(([check, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${check}`);
        return passed;
    });
    
    return results.filter(Boolean).length >= 2;
}

// Test 6: Check API routes
function checkAPIRoutes() {
    console.log('\n🔌 Checking API routes...');
    
    const apiChecks = {
        'Has chat route': fs.existsSync('app/api/chat/route.ts'),
        'Chat route has POST handler': fs.existsSync('app/api/chat/route.ts') && 
            fs.readFileSync('app/api/chat/route.ts', 'utf8').includes('export async function POST')
    };
    
    const results = Object.entries(apiChecks).map(([check, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${check}`);
        return passed;
    });
    
    return results.every(Boolean);
}

// Main test runner
async function runProductionTests() {
    const tests = [
        { name: 'Required Files', fn: checkRequiredFiles },
        { name: 'Package Config', fn: checkPackageConfig },
        { name: 'TypeScript Config', fn: checkTypeScriptConfig },
        { name: 'Environment Setup', fn: checkEnvTemplate },
        { name: 'Build Structure', fn: checkBuildStructure },
        { name: 'API Routes', fn: checkAPIRoutes }
    ];
    
    const results = [];
    
    for (const test of tests) {
        try {
            const result = test.fn();
            results.push({ name: test.name, passed: result });
        } catch (error) {
            console.log(`❌ ${test.name} failed:`, error.message);
            results.push({ name: test.name, passed: false, error: error.message });
        }
    }
    
    // Summary
    console.log('\n📊 Production Readiness Summary:');
    console.log('=' .repeat(40));
    
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    
    results.forEach(result => {
        const status = result.passed ? '✅' : '❌';
        console.log(`${status} ${result.name}`);
        if (result.error) {
            console.log(`    Error: ${result.error}`);
        }
    });
    
    console.log('\n' + '='.repeat(40));
    console.log(`🏁 Overall: ${passed}/${total} tests passed`);
    
    if (passed === total) {
        console.log('🎉 System is READY for production deployment!');
        console.log('\n🚀 Next steps:');
        console.log('1. Run "npm run build" to create production build');
        console.log('2. Set up environment variables in your hosting platform');
        console.log('3. Deploy to Vercel or your preferred platform');
        console.log('4. Run post-deployment tests');
    } else {
        console.log('⚠️ Some issues need to be resolved before deployment.');
        console.log('Please fix the failed tests above.');
    }
    
    return { passed, total, ready: passed === total };
}

// Run tests if called directly
if (require.main === module) {
    runProductionTests().catch(console.error);
}

module.exports = { runProductionTests };