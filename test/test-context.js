var testContext = require.context('.', true, /\.ts$/);
// var sourceContext = require.context('../src', true, /\.ts$/);

function requireAll(requireContext) {
    requireContext.keys().map(requireContext);
}

requireAll(testContext);
// requireAll(sourceContext);
