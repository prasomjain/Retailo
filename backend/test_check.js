const dataService = require('./src/services/dataService');

(async () => {
  try {
    console.log('Calling getFilterOptions...');
    const opts = await dataService.getFilterOptions();
    console.log('Filter options loaded:', Object.keys(opts));
  } catch (err) {
    console.error('getFilterOptions error:', err && err.stack ? err.stack : err);
  }

  try {
    console.log('\nCalling streamAndProcessData (page 1)...');
    const res = await dataService.streamAndProcessData('', {}, 'date', 'desc', 1, 5);
    console.log('streamAndProcessData returned:', Object.keys(res));
    console.log('Sample data length:', res.data.length);
  } catch (err) {
    console.error('streamAndProcessData error:', err && err.stack ? err.stack : err);
  }
})();