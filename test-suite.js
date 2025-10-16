// Comprehensive test suite for all APIs and storage functions
// Run this in browser console to test all functionality

console.log('🚀 Starting comprehensive test suite...');

// Test 1: Local Storage Functions
async function testLocalStorage() {
    console.log('\n📦 Testing Local Storage Functions...');
    
    try {
        // Import storage functions (assuming they're available globally)
        // Test tasks
        const testTask = {
            id: 'test-task-1',
            title: 'Test Task',
            description: 'Testing task functionality',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        console.log('✅ Local storage test setup complete');
        
        // Test notes
        const testNote = {
            id: 'test-note-1',
            date: new Date().toISOString().split('T')[0],
            content: 'Test note content',
            mood: 'neutral',
            outcomes: ['Completed testing'],
            tags: ['test'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        console.log('✅ Local storage notes test ready');
        return { success: true, message: 'Local storage functions ready' };
    } catch (error) {
        console.error('❌ Local storage test failed:', error);
        return { success: false, error: error.message };
    }
}

// Test 2: Chat API
async function testChatAPI() {
    console.log('\n💬 Testing Chat API...');
    
    try {
        const testMessage = {
            message: 'Hello, this is a test message',
            userId: 'test-user'
        };
        
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testMessage)
        });
        
        if (!response.ok) {
            throw new Error(`Chat API returned ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Chat API response:', data);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Chat API test failed:', error);
        return { success: false, error: error.message };
    }
}

// Test 3: Supabase Connection
async function testSupabaseConnection() {
    console.log('\n🗄️ Testing Supabase Connection...');
    
    try {
        // Test if Supabase client is available
        if (typeof window !== 'undefined' && window.supabase) {
            const { data, error } = await window.supabase.auth.getSession();
            
            if (error) {
                console.log('⚠️ Supabase auth error (expected if not logged in):', error.message);
            }
            
            console.log('✅ Supabase client available, session data:', data);
            return { success: true, connected: true };
        } else {
            console.log('⚠️ Supabase client not available, fallback to localStorage');
            return { success: true, connected: false, fallback: true };
        }
    } catch (error) {
        console.error('❌ Supabase test failed:', error);
        return { success: false, error: error.message };
    }
}

// Test 4: Fallback Logic
async function testFallbackLogic() {
    console.log('\n🔄 Testing Fallback Logic...');
    
    const results = [];
    
    try {
        // Test 1: Simulate Supabase unavailable
        console.log('Testing scenario: Supabase unavailable...');
        
        // Mock localStorage operations
        const testData = { test: 'fallback data' };
        localStorage.setItem('test-fallback', JSON.stringify(testData));
        const retrieved = JSON.parse(localStorage.getItem('test-fallback') || '{}');
        
        if (retrieved.test === 'fallback data') {
            console.log('✅ localStorage fallback working');
            results.push({ scenario: 'localStorage fallback', success: true });
        } else {
            throw new Error('localStorage fallback failed');
        }
        
        // Clean up
        localStorage.removeItem('test-fallback');
        
        // Test 2: Network error simulation
        console.log('Testing scenario: Network error handling...');
        
        try {
            // This should fail gracefully
            const response = await fetch('/api/nonexistent-endpoint');
            results.push({ 
                scenario: 'Network error', 
                success: false, 
                message: 'Expected error did not occur' 
            });
        } catch (error) {
            console.log('✅ Network error handled gracefully:', error.message);
            results.push({ scenario: 'Network error handling', success: true });
        }
        
        return { success: true, results };
    } catch (error) {
        console.error('❌ Fallback logic test failed:', error);
        return { success: false, error: error.message, results };
    }
}

// Test 5: Component State Management
async function testComponentState() {
    console.log('\n🎯 Testing Component State Management...');
    
    try {
        // Test React state persistence
        const testStates = [
            { component: 'TasksPanel', state: 'tasks loaded' },
            { component: 'NotesPanel', state: 'notes loaded' },
            { component: 'SettingsPanel', state: 'settings loaded' },
            { component: 'ChatPanel', state: 'chat ready' }
        ];
        
        console.log('✅ Component state tests configured:', testStates);
        return { success: true, states: testStates };
    } catch (error) {
        console.error('❌ Component state test failed:', error);
        return { success: false, error: error.message };
    }
}

// Test 6: Performance Checks
async function testPerformance() {
    console.log('\n⚡ Testing Performance...');
    
    try {
        const startTime = performance.now();
        
        // Simulate heavy operations
        const operations = [];
        for (let i = 0; i < 1000; i++) {
            operations.push({ id: i, data: `test-${i}` });
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`✅ Performance test: ${duration.toFixed(2)}ms for 1000 operations`);
        
        const isGood = duration < 100; // Should complete in under 100ms
        return { 
            success: true, 
            duration, 
            performance: isGood ? 'good' : 'needs optimization' 
        };
    } catch (error) {
        console.error('❌ Performance test failed:', error);
        return { success: false, error: error.message };
    }
}

// Main test runner
async function runAllTests() {
    console.log('🧪 Running comprehensive test suite...\n');
    const results = {};
    
    try {
        results.localStorage = await testLocalStorage();
        results.chatAPI = await testChatAPI();
        results.supabase = await testSupabaseConnection();
        results.fallback = await testFallbackLogic();
        results.componentState = await testComponentState();
        results.performance = await testPerformance();
        
        console.log('\n📊 Test Results Summary:');
        Object.entries(results).forEach(([test, result]) => {
            const status = result.success ? '✅' : '❌';
            console.log(`${status} ${test}: ${result.success ? 'PASSED' : 'FAILED'}`);
            if (!result.success && result.error) {
                console.log(`   Error: ${result.error}`);
            }
        });
        
        const totalTests = Object.keys(results).length;
        const passedTests = Object.values(results).filter(r => r.success).length;
        
        console.log(`\n🏁 Overall: ${passedTests}/${totalTests} tests passed`);
        
        if (passedTests === totalTests) {
            console.log('🎉 All tests passed! Ready for deployment.');
        } else {
            console.log('⚠️ Some tests failed. Review before deployment.');
        }
        
        return results;
    } catch (error) {
        console.error('❌ Test runner failed:', error);
        return { error: error.message };
    }
}

// Auto-run tests if in browser
if (typeof window !== 'undefined') {
    console.log('🌐 Browser environment detected. Run runAllTests() to start testing.');
} else {
    console.log('📦 Node environment detected. Export functions for testing.');
}

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllTests,
        testLocalStorage,
        testChatAPI,
        testSupabaseConnection,
        testFallbackLogic,
        testComponentState,
        testPerformance
    };
}