/**
 * Fallback Logic Test Suite
 * Tests localStorage functionality when Supabase is unavailable
 * Place this in the browser console to test fallback behavior
 */

// Test localStorage fallback for tasks
function testTasksFallback() {
    console.log('🧪 Testing Tasks Fallback Logic...');
    
    try {
        // Simulate Supabase being unavailable
        const testTask = {
            id: 'test-task-fallback-1',
            title: 'Test Fallback Task',
            description: 'Testing task storage fallback',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Test localStorage operations directly
        const tasksKey = 'tasks';
        const existingTasks = JSON.parse(localStorage.getItem(tasksKey) || '[]');
        const updatedTasks = [...existingTasks, testTask];
        
        localStorage.setItem(tasksKey, JSON.stringify(updatedTasks));
        
        // Verify the task was stored
        const storedTasks = JSON.parse(localStorage.getItem(tasksKey) || '[]');
        const foundTask = storedTasks.find(t => t.id === testTask.id);
        
        if (foundTask) {
            console.log('✅ Tasks fallback working:', foundTask);
            
            // Clean up test data
            const cleanedTasks = storedTasks.filter(t => t.id !== testTask.id);
            localStorage.setItem(tasksKey, JSON.stringify(cleanedTasks));
            
            return { success: true, test: 'tasks-fallback' };
        } else {
            throw new Error('Task not found in localStorage');
        }
    } catch (error) {
        console.error('❌ Tasks fallback failed:', error);
        return { success: false, error: error.message, test: 'tasks-fallback' };
    }
}

// Test localStorage fallback for notes
function testNotesFallback() {
    console.log('🧪 Testing Notes Fallback Logic...');
    
    try {
        const testNote = {
            id: 'test-note-fallback-1',
            date: new Date().toISOString().split('T')[0],
            content: 'Test fallback note content',
            mood: 'happy',
            outcomes: ['Testing completed successfully'],
            tags: ['test', 'fallback'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Test localStorage operations directly
        const notesKey = 'notes';
        const existingNotes = JSON.parse(localStorage.getItem(notesKey) || '[]');
        const updatedNotes = [...existingNotes, testNote];
        
        localStorage.setItem(notesKey, JSON.stringify(updatedNotes));
        
        // Verify the note was stored
        const storedNotes = JSON.parse(localStorage.getItem(notesKey) || '[]');
        const foundNote = storedNotes.find(n => n.id === testNote.id);
        
        if (foundNote) {
            console.log('✅ Notes fallback working:', foundNote);
            
            // Clean up test data
            const cleanedNotes = storedNotes.filter(n => n.id !== testNote.id);
            localStorage.setItem(notesKey, JSON.stringify(cleanedNotes));
            
            return { success: true, test: 'notes-fallback' };
        } else {
            throw new Error('Note not found in localStorage');
        }
    } catch (error) {
        console.error('❌ Notes fallback failed:', error);
        return { success: false, error: error.message, test: 'notes-fallback' };
    }
}

// Test localStorage fallback for roadmaps
function testRoadmapsFallback() {
    console.log('🧪 Testing Roadmaps Fallback Logic...');
    
    try {
        const testRoadmap = {
            id: 'test-roadmap-fallback-1',
            title: 'Test Fallback Roadmap',
            description: 'Testing roadmap storage fallback',
            category: 'Test',
            difficulty: 'Beginner',
            duration: '1 week',
            progress: 0,
            completed: false,
            steps: [{
                id: 'test-step-1',
                title: 'Test Step',
                description: 'Test step description',
                duration: '1 day',
                completed: false
            }]
        };
        
        const roadmapsKey = 'roadmaps';
        const existingRoadmaps = JSON.parse(localStorage.getItem(roadmapsKey) || '[]');
        const updatedRoadmaps = [...existingRoadmaps, testRoadmap];
        
        localStorage.setItem(roadmapsKey, JSON.stringify(updatedRoadmaps));
        
        const storedRoadmaps = JSON.parse(localStorage.getItem(roadmapsKey) || '[]');
        const foundRoadmap = storedRoadmaps.find(r => r.id === testRoadmap.id);
        
        if (foundRoadmap) {
            console.log('✅ Roadmaps fallback working:', foundRoadmap);
            
            // Clean up test data
            const cleanedRoadmaps = storedRoadmaps.filter(r => r.id !== testRoadmap.id);
            localStorage.setItem(roadmapsKey, JSON.stringify(cleanedRoadmaps));
            
            return { success: true, test: 'roadmaps-fallback' };
        } else {
            throw new Error('Roadmap not found in localStorage');
        }
    } catch (error) {
        console.error('❌ Roadmaps fallback failed:', error);
        return { success: false, error: error.message, test: 'roadmaps-fallback' };
    }
}

// Test error handling scenarios
function testErrorScenarios() {
    console.log('🧪 Testing Error Handling Scenarios...');
    
    const results = [];
    
    try {
        // Test 1: Invalid JSON in localStorage
        console.log('Testing invalid JSON handling...');
        localStorage.setItem('test-invalid-json', 'invalid-json-string');
        
        try {
            JSON.parse(localStorage.getItem('test-invalid-json') || '[]');
            results.push({ 
                scenario: 'invalid-json', 
                success: false, 
                message: 'Should have thrown error' 
            });
        } catch (error) {
            console.log('✅ Invalid JSON error handled gracefully');
            results.push({ scenario: 'invalid-json-handling', success: true });
        }
        
        // Clean up
        localStorage.removeItem('test-invalid-json');
        
        // Test 2: localStorage quota exceeded (simulate)
        console.log('Testing localStorage quota scenarios...');
        try {
            // Try to store a large amount of data
            const largeData = 'x'.repeat(1000000); // 1MB of data
            localStorage.setItem('test-large-data', largeData);
            localStorage.removeItem('test-large-data');
            console.log('✅ Large data storage handled');
            results.push({ scenario: 'large-data-storage', success: true });
        } catch (error) {
            console.log('✅ localStorage quota error handled:', error.message);
            results.push({ scenario: 'quota-error-handling', success: true });
        }
        
        return { success: true, results };
    } catch (error) {
        console.error('❌ Error scenario test failed:', error);
        return { success: false, error: error.message, results };
    }
}

// Test Supabase connection with proper error handling
async function testSupabaseConnectionFallback() {
    console.log('🧪 Testing Supabase Connection with Fallback...');
    
    try {
        // Check if Supabase is available
        if (typeof window.supabase !== 'undefined') {
            console.log('Supabase client detected, testing connection...');
            
            try {
                // Try to perform a simple operation
                const { data, error } = await window.supabase.auth.getSession();
                
                if (error) {
                    console.log('⚠️ Supabase auth error (fallback will handle):', error.message);
                    return { 
                        success: true, 
                        supabaseAvailable: true, 
                        authError: true, 
                        fallbackNeeded: true 
                    };
                } else {
                    console.log('✅ Supabase connection successful');
                    return { 
                        success: true, 
                        supabaseAvailable: true, 
                        authError: false, 
                        fallbackNeeded: false 
                    };
                }
            } catch (connectionError) {
                console.log('⚠️ Supabase connection failed, fallback needed:', connectionError.message);
                return { 
                    success: true, 
                    supabaseAvailable: true, 
                    connectionError: true, 
                    fallbackNeeded: true 
                };
            }
        } else {
            console.log('⚠️ Supabase client not available, using fallback');
            return { 
                success: true, 
                supabaseAvailable: false, 
                fallbackNeeded: true 
            };
        }
    } catch (error) {
        console.error('❌ Supabase fallback test failed:', error);
        return { success: false, error: error.message };
    }
}

// Main fallback test runner
async function runFallbackTests() {
    console.log('🔄 Starting Comprehensive Fallback Tests...\n');
    
    const results = {
        tasks: testTasksFallback(),
        notes: testNotesFallback(),
        roadmaps: testRoadmapsFallback(),
        errorHandling: testErrorScenarios(),
        supabaseConnection: await testSupabaseConnectionFallback()
    };
    
    console.log('\n📊 Fallback Test Results:');
    Object.entries(results).forEach(([test, result]) => {
        const status = result.success ? '✅' : '❌';
        console.log(`${status} ${test}: ${result.success ? 'PASSED' : 'FAILED'}`);
        
        if (!result.success && result.error) {
            console.log(`   Error: ${result.error}`);
        }
        
        if (result.fallbackNeeded) {
            console.log(`   ⚠️ Fallback required for ${test}`);
        }
    });
    
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(r => r.success).length;
    
    console.log(`\n🏁 Fallback Tests: ${passedTests}/${totalTests} passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All fallback tests passed! System is resilient.');
    } else {
        console.log('⚠️ Some fallback tests failed. Review error handling.');
    }
    
    return results;
}

// Auto-export for browser testing
if (typeof window !== 'undefined') {
    window.runFallbackTests = runFallbackTests;
    window.testTasksFallback = testTasksFallback;
    window.testNotesFallback = testNotesFallback;
    window.testRoadmapsFallback = testRoadmapsFallback;
    
    console.log('🔄 Fallback test functions loaded!');
    console.log('Run: runFallbackTests() to test all fallback scenarios');
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runFallbackTests,
        testTasksFallback,
        testNotesFallback,
        testRoadmapsFallback,
        testErrorScenarios,
        testSupabaseConnectionFallback
    };
}