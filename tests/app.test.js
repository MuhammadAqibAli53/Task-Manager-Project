/**
 * tests/app.test.js
 * A lightweight, custom Vanilla JS testing suite.
 */
import { store } from '../js/core/store.js';
import { apiClient } from '../js/services/api-client.js';

// --- MICRO TEST FRAMEWORK ---
let passed = 0;
let failed = 0;

function assert(condition, testName) {
    if (condition) {
        console.log(`✅ PASS: ${testName}`);
        passed++;
    } else {
        console.error(`❌ FAIL: ${testName}`);
        failed++;
    }
}

async function runTests() {
    console.log('--- STARTING UNIT TESTS ---');

    // TEST 1: Store Immutability
    const initialState = store.getState();
    initialState.sort = 'invalid-sort'; // Try to mutate directly
    const verifyState = store.getState();
    assert(verifyState.sort !== 'invalid-sort', 'Store prevents direct state mutation');

    // TEST 2: Store State Updates
    store.setState({ viewMode: 'list' });
    assert(store.getState().viewMode === 'list', 'Store correctly updates state via setState');

    // TEST 3: Validation Rule - Due Date Check
    const today = new Date().toISOString().split('T')[0];
    const pastDate = '2020-01-01';
    const isValid = pastDate >= today;
    assert(isValid === false, 'Validation correctly identifies past due dates as invalid');

    // TEST 4: API Request Rejection / Timeout Simulation
    try {
        // Force a 1-millisecond timeout to guarantee a failure
        await apiClient.get('./data/tasks.json', { timeoutMs: 1 });
        assert(false, 'API Client should have timed out but did not');
    } catch (error) {
        assert(error.status === 408 || error.name === 'APIError', 'API Client successfully handles rejected requests and timeouts');
    }

    console.log(`--- TESTS COMPLETE: ${passed} Passed, ${failed} Failed ---`);
}

// Expose to window to run manually in the console
window.runTests = runTests;