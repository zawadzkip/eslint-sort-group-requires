/**
 * @fileoverview Sorts requires statements, and then groups by type
 * @author Patrick Zawadzki
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/sort-group-requires");

var code = (lines) => lines.join('\n');

var RuleTester = require("eslint").RuleTester;

RuleTester.setDefaultConfig({
    parserOptions: {
        ecmaVersion: 6,
        ecmaFeatures: {
            jsx: true,
        },
    },
});


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("sort-group-requires", rule, {
    valid: [
        code([
            'var item = require("test");',
            'var mod = require("module");',
        ]),
        code([
            'var item = require("module");',
            'var localFile = require("./file");',
            'var Error = require("./error");'
        ]),
    ],
    invalid: [
        {
            code: code([
                'var mod = require("module");',
                'var item = require("test");',
            ]),
            errors: [{
                message: "Required statement found is out of order, reordering elements",
            }]
        }
    ]
});
