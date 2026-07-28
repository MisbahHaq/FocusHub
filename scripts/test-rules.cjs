/**
 * Firestore Security Rules Test Suite
 * Run with: npm run test:rules
 * 
 * Requires: firebase-tools installed globally, Firestore emulator configured.
 */

const { initializeTestApp, initializeAdminApp, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { setDoc, doc, updateDoc, addDoc, collection, getDoc } = require('firebase/firestore');

const PROJECT_ID = 'focus-synergy-test';

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✓ ${message}`);
        passed++;
    } else {
        console.error(`  ✗ ${message}`);
        failed++;
    }
}

async function runTests() {
    console.log('Running Firestore Security Rules Tests...\n');

    const testUser = { uid: 'testuser123', email: 'test@example.com' };
    const otherUser = { uid: 'otheruser', email: 'other@example.com' };
    const attacker = { uid: 'attacker', email: 'attacker@example.com' };

    // Use admin app to seed data
    const adminDb = initializeAdminApp({ projectId: PROJECT_ID }).firestore();

    // Seed a test item
    await setDoc(doc(adminDb, 'users', testUser.uid, 'items', 'item1'), {
        name: 'Test Item',
        accumulatedSeconds: 100,
        isRunning: false,
        startedAt: null,
        userId: testUser.uid
    });

    // Seed a test item for other user
    await setDoc(doc(adminDb, 'users', otherUser.uid, 'items', 'item1'), {
        name: 'Other Item',
        accumulatedSeconds: 50,
        isRunning: false,
        startedAt: null,
        userId: otherUser.uid
    });

    // Test 1: Unauthenticated access should be denied
    console.log('Test 1: Unauthenticated access');
    try {
        const unauthenticated = initializeTestApp({ projectId: PROJECT_ID, auth: null });
        await setDoc(doc(unauthenticated.firestore(), 'users', testUser.uid, 'items', 'item1'), { name: 'Hack' });
        assert(false, 'Unauthenticated write should be denied');
    } catch (e) {
        assert(true, 'Unauthenticated write denied');
    }

    // Test 2: Cross-user write should be denied
    console.log('\nTest 2: Cross-user write');
    try {
        const attackerApp = initializeTestApp({ projectId: PROJECT_ID, auth: attacker });
        await setDoc(doc(attackerApp.firestore(), 'users', testUser.uid, 'items', 'item1'), { name: 'Hacked' });
        assert(false, 'Cross-user write should be denied');
    } catch (e) {
        assert(true, 'Cross-user write denied');
    }

    // Test 3: Own-user write should succeed
    console.log('\nTest 3: Own-user write');
    try {
        const userApp = initializeTestApp({ projectId: PROJECT_ID, auth: testUser });
        await assertSucceeds(setDoc(doc(userApp.firestore(), 'users', testUser.uid, 'items', 'item1'), { name: 'Updated' }));
        assert(true, 'Own-user write allowed');
    } catch (e) {
        assert(false, 'Own-user write should be allowed: ' + e.message);
    }

    // Test 4: Negative accumulatedSeconds should be rejected
    console.log('\nTest 4: Schema validation - negative accumulatedSeconds');
    try {
        const userApp = initializeTestApp({ projectId: PROJECT_ID, auth: testUser });
        await assertFails(updateDoc(doc(userApp.firestore(), 'users', testUser.uid, 'items', 'item1'), { accumulatedSeconds: -5 }));
        assert(true, 'Negative accumulatedSeconds rejected');
    } catch (e) {
        assert(false, 'Negative accumulatedSeconds should be rejected: ' + e.message);
    }

    // Test 5: Negative seconds in logs should be rejected
    console.log('\nTest 5: Schema validation - negative seconds in logs');
    try {
        const userApp = initializeTestApp({ projectId: PROJECT_ID, auth: testUser });
        await assertFails(addDoc(collection(userApp.firestore(), 'users', testUser.uid, 'logs'), { seconds: -10, timestamp: Date.now() }));
        assert(true, 'Negative seconds in logs rejected');
    } catch (e) {
        assert(false, 'Negative seconds in logs should be rejected: ' + e.message);
    }

    // Test 6: isRunning=true without activeTimer should be rejected
    console.log('\nTest 6: isRunning=true without activeTimer');
    try {
        const userApp = initializeTestApp({ projectId: PROJECT_ID, auth: testUser });
        await assertFails(updateDoc(doc(userApp.firestore(), 'users', testUser.uid, 'items', 'item1'), { isRunning: true }));
        assert(true, 'isRunning=true without activeTimer rejected');
    } catch (e) {
        assert(false, 'isRunning=true without activeTimer should be rejected: ' + e.message);
    }

    // Test 7: Valid active timer start should succeed
    console.log('\nTest 7: Valid active timer start');
    try {
        const userApp = initializeTestApp({ projectId: PROJECT_ID, auth: testUser });
        const now = Date.now();
        await assertSucceeds(setDoc(doc(userApp.firestore(), 'users', testUser.uid, 'meta', 'activeTimer'), { itemId: 'item1', startedAt: now }));
        await assertSucceeds(updateDoc(doc(userApp.firestore(), 'users', testUser.uid, 'items', 'item1'), { isRunning: true, startedAt: now }));
        assert(true, 'Valid active timer start allowed');
    } catch (e) {
        assert(false, 'Valid active timer start should be allowed: ' + e.message);
    }

    // Test 8: Setting isRunning=true on wrong item should be rejected
    console.log('\nTest 8: Invalid active timer (mismatched item)');
    try {
        const userApp = initializeTestApp({ projectId: PROJECT_ID, auth: testUser });
        await setDoc(doc(adminDb, 'users', testUser.uid, 'items', 'item2'), { name: 'Item2', isRunning: false, accumulatedSeconds: 0, userId: testUser.uid });
        await assertFails(updateDoc(doc(userApp.firestore(), 'users', testUser.uid, 'items', 'item2'), { isRunning: true }));
        assert(true, 'Non-active item isRunning=true rejected');
    } catch (e) {
        assert(false, 'Non-active item isRunning=true should be rejected: ' + e.message);
    }

    // Test 9: isRunning=false should always be allowed
    console.log('\nTest 9: Stopping timer (isRunning=false)');
    try {
        const userApp = initializeTestApp({ projectId: PROJECT_ID, auth: testUser });
        await assertSucceeds(updateDoc(doc(userApp.firestore(), 'users', testUser.uid, 'items', 'item1'), { isRunning: false, startedAt: null, accumulatedSeconds: 200 }));
        assert(true, 'Stopping timer allowed');
    } catch (e) {
        assert(false, 'Stopping timer should be allowed: ' + e.message);
    }

    // Test 10: ActiveTimer meta write by own user
    console.log('\nTest 10: ActiveTimer meta write');
    try {
        const userApp = initializeTestApp({ projectId: PROJECT_ID, auth: testUser });
        await assertSucceeds(setDoc(doc(userApp.firestore(), 'users', testUser.uid, 'meta', 'activeTimer'), { itemId: null, startedAt: null }));
        assert(true, 'ActiveTimer meta write allowed');
    } catch (e) {
        assert(false, 'ActiveTimer meta write should be allowed: ' + e.message);
    }

    // Summary
    console.log('\n--- Results ---');
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(failed === 0 ? '\nAll tests passed!' : '\nSome tests failed.');

    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(e => {
    console.error('Test runner error:', e);
    process.exit(1);
});
