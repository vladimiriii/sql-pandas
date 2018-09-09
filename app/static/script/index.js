

/*-------------------------------------
On page ready
-------------------------------------*/
$(document).ready(function(){

	$('#submitButton').click(function() {

		const sqlInput = $('#sqlInput').val();

		const sqlQuery = processSQL(sqlInput);

		createOutput(sqlQuery);

	});
});

// Splits and processes SQL
function processSQL(query) {

	// Remove comments
	query = query.replace(/(\/\*.*\*\/)/g, '').replace(/--.*/g, '');

	// Remove multiple spaces and leading/trailing whitespace
	query = query.replace(/\s\s+/g, ' ').replace(/^\s+|\s+$/g, '');

	const selectClause = selectClauseProcessing(query)

	// FROM clause
	const fromClause = fromClauseProcessing(query);

	// WHERE Clause
	const whereClause = whereClauseProcessing(query);

	return fromClause + whereClause + selectClause["columnClause"] + (("renameClause" in selectClause) ? selectClause["renameClause"] : "")
};

function createOutput(text) {
	$('#pandasOutput').empty();
	$('#pandasOutput').append(text);
};

/*------------------------------------------
SELECT clause
------------------------------------------*/
function selectClauseProcessing(query) {
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
	renameClause = '';
	for (idx in aliases) {
		if (aliases[idx] != null) {
			renameClause += '"' + columns[idx] + '": "' + aliases[idx] + '", ';
		};
	};

	if (renameClause.length > 0) {
		renameClause = ".rename(columns={" + renameClause.substring(0, renameClause.length - 2) + "})";
	};

	return {"columnClause": columnClause, "renameClause": renameClause}
}

/*------------------------------------------
FROM clause
------------------------------------------*/
function fromClauseProcessing(query) {
	fromClause = query
		.substring(query.toLowerCase().indexOf('from')
			, ( query.toLowerCase().indexOf('where') == -1) ? query.length : query.toLowerCase().indexOf('where'))
		.substring(4);

	// Split on Joins
	fromClause = fromClause.split(/join/i);

	cleanFromClause = [];
	for (cIdx in fromClause) {
		d = {};
		curClause = fromClause[cIdx].replace(/\s\s+/g, ' ').replace(/^\s+|\s+$/g, '');
		if (curClause.indexOf("(") >= 0) {
			temp = curClause.match(/\((\s?.*)*\)/g);
			d['subquery'] = temp[0].substring(1, temp[0].length - 1)
					.replace(/\s\s+/g, ' ')
					.replace(/^\s+|\s+$/g, '');
			cleanFromClause.push(d);
		} else {
			d['table'] = curClause.substring(0, Math.max(curClause.length, curClause.indexOf(' ')))
					.replace(/\s\s+/g, ' ')
					.replace(/^\s+|\s+$/g, '');

			cleanFromClause.push(d);
		}
	};

	return cleanFromClause[0]['table'];
}

/*------------------------------------------
WHERE clause
------------------------------------------*/
function whereClauseProcessing(query) {
	whereClause = query
		.substring(query.toLowerCase().indexOf('where')
			, ( query.toLowerCase().indexOf('union') == -1) ? query.length : query.toLowerCase().indexOf('union') )
		.substring(6);

	cleanWhereClause = whereClause
		.replace(/\n/g, ' ') // Remove carriage returns
		.replace(/\s\s+/g, ' ') // Remove double spaces
		.replace(/^\s+|\s+$/g, '') // Remove leading and trailing whitespace
		.replace(/ and /gi, ' & ') // Replace AND with &
		.replace(/ or /gi, ' | ') // Replace OR with |
		.replace(/(?<!<|>|!)=/g, '==') // Replace single '=' with '=='
		.replace(/(\w+)\s+not in\s*\((.+?)\)/gi, "~$1.isin([$2])") // Replace NOT IN clause with ~x.isin()
		.replace(/\s+in\s*\((.+?)\)/gi, ".isin([$1])") // Replace IN clause with x.isin()
		.replace(/(\w+)\s+is null/gi, "$1.isna()") // Replace IS NULL with .isna()
		.replace(/(\w+)\s+is not null/gi, "~$1.isna()"); // Replace IS NIT NULL with ~x.isna()

	// whereClause = whereClause.join(' & ');
	output = '.query("' + cleanWhereClause + '")';

	return output;
}


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
