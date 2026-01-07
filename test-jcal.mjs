// Test if jcal-zmanim handles date overflow
import { jDate } from 'jcal-zmanim';

console.log('=== Testing jDate with day 45 ===\n');

try {
    const jd = new jDate(5784, 1, 45);
    console.log('Created jDate(5784, 1, 45):');
    console.log('  Year:', jd.Year);
    console.log('  Month:', jd.Month);
    console.log('  Day:', jd.Day);
    console.log('  toString:', jd.toString());
    console.log('\n✓ jcal-zmanim handles overflow like JavaScript Date');
} catch (e) {
    console.log('✗ Error:', e.message);
    console.log('\njcal-zmanim does NOT handle overflow - throws error');
}

console.log('\n=== Comparison with proper date ===');
const proper = new jDate(5784, 1, 15);
console.log('jDate(5784, 1, 15):', proper.toString());

console.log('\n=== What should day 45 be? ===');
const start = new jDate(5784, 1, 1);
const plus44 = start.addDays(44); // Day 1 + 44 days = Day 45
console.log('1 Nissan + 44 days:', plus44.toString());
console.log('  Year:', plus44.Year);
console.log('  Month:', plus44.Month);
console.log('  Day:', plus44.Day);
