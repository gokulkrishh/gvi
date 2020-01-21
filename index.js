#!/usr/bin/env node

"use strict";

const fetch = require("node-fetch");
const Table = require("cli-table");
const Ora = require("ora");

const spinner = new Ora();

var table = new Table({
	head: ["Release Names", "Versions", "Updated on"],
	colWidths: [25, 50, 40]
});

const packageName = process.argv.pop();

spinner.start();

console.log("Searching ..");

const getLocalDate = timeZone => {
	var dt = new Date(timeZone);
	var minutes = dt.getTimezoneOffset();
	return new Date(dt.getTime() + minutes * 60000);
};

const dateFormatOptions = {
	weekday: "short",
	year: "numeric",
	month: "short",
	day: "numeric"
};

fetch(`https://registry.npmjs.org/${packageName}`)
	.then(response => response.json())
	.then(response => {
		spinner.stop();
		if (response && response.error) {
			console.log(`📦  Package not found! `);
			return false;
		}

		const releaseTags = response["dist-tags"];
		const releaseTime = response["time"];
		const releaseTagsKeys = Object.keys(releaseTags);

		table.push(
			...releaseTagsKeys.map(releaseTag => [
				releaseTag,
				releaseTags[releaseTag],
				getLocalDate(releaseTime[releaseTags[releaseTag]]).toLocaleDateString(
					"en-US",
					dateFormatOptions
				)
			])
		);
		console.log(`📦  Package: \x1b[33m${packageName} \x1b[0m`);
		console.log(table.toString());
	})
	.catch(error => {
		spinner.stop();
		console.log("Error occurred while fetch the package. Try again!");
	});
