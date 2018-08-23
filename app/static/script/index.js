

/*-------------------------------------
On page ready
-------------------------------------*/
$(document).ready(function(){

	$('#submitButton').click(function() {
		const sqlInput = $('#sqlInput').val();

		const queryComponents = processSQL(sqlInput);

	});
});

// Splits and processes SQL
function processSQL(query) {

	// Remove comments
	query = query.replace(/(\/\*.*\*\/)/g, '').replace(/--.*/g, '');

	// Remove multiple spaces and leading/trailing whitespace
	query = query.replace(/\s\s+/g, ' ').replace(/^\s+|\s+$/g, '');

	// Split into components
	rawColumns = query
		.substring(0, query.toLowerCase().indexOf('from'))
		.substring(query.toLowerCase().indexOf(' '))
		.split(",");

	columns = [];
	aliases = [];
	for (colIdx in rawColumns) {
		row = rawColumns[colIdx].replace(/^\s+|\s+$/g, ''); // trim whitespace from each row

		if (row.toLowerCase().indexOf(" as ") >= 0) {
			columns[colIdx] = row.substring(0, row.indexOf(" "));
			aliases[colIdx] = row.substring(row.toLowerCase().indexOf(" as ") + 4);
		}
		else if (row.toLowerCase().indexOf(" ") >= 0) {
			columns[colIdx] = row.substring(0, row.indexOf(" "));
			aliases[colIdx] = row.substring(row.toLowerCase().indexOf(" ") + 1);
		}
		else {
			columns[colIdx] = row.replace(/^\s+|\s+$/g, '');
			aliases[colIdx] = null;
		};
	};

	// Generate columns and rename clause
	columnClause = '[["' + columns.join('", "') + '"]]';
	renameClause = ".rename(columns={";
	for (idx in aliases) {
		if (aliases[idx] != null) {
			renameClause += '"' + columns[idx] + '": "' + aliases[idx] + '", ';
		};
	};
	renameClause = renameClause.substring(0, renameClause.length - 2) + "})";

	// FROM clause
	fromClause = query
		.substring(query.toLowerCase().indexOf('from'), Math.max(query.toLowerCase().indexOf('where'), query.length))
		.substring(4)
		.replace(/\s\s+/g, ' ').replace(/^\s+|\s+$/g, '')
		.split(' ');

	console.log(fromClause);

	// Combine query elements
	const pandasQuery = fromClause[0] + columnClause + renameClause
	$('#pandasOutput').empty();
	$('#pandasOutput').append(pandasQuery);

	// fromStatement = query.substring(query.toLowerCase().indexOf('from'), query.toLowerCase().indexOf('where'));
	// whereStatement = query.substring(query.toLowerCase().indexOf('where'), query.length);
	//
	// // Standardize string and split into an array
	// // query = query.match(/[^\r\n]+/g);
	// console.log(selectStatement);
	// console.log(fromStatement);
	// console.log(whereStatement);

	// // Determine is SELECT or WITH query
	// firstCommand = query[0].toLowerCase();
	//
	// // If SELECT statement first
	// if (firstCommand == 'select') {
	//
	// }


}
