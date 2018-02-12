/**
 * Inspiration taken from https://github.com/kentor/eslint-plugin-sort-requires/blob/master/dist/rules/sort-requires.js
 *
 * @fileoverview Sorts requires statements, and then groups by type
 * @author Patrick Zawadzki
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "Sorts requires statements, and then groups by type",
            category: "Stylistic Issues",
            recommended: false
        },
        fixable: "code",  // or "code" or "whitespace"
        schema: [
            // fill in your schema
        ]
    },

    create: function(context) {
        const source = context.getSourceCode();
        const hasRequire = /require\(/;
        const isLocalFile = /\(('|")\./;
        const isFunction = /\((.)+\)\./;
        const isError = /(error|Error)/;
        const isConstant = /constants/;
        const groups = {
            modules: [],
            constants: [],
            errors: [],
            files: [],
            functions: [],
        };

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        // any helper functions should go here or else delete this section

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------

        function sortGroups() {
            for (const key in groups) {
                if (!groups.hasOwnProperty(key)) {
                    continue;
                }

                groups[key].sort((a,b) => {
                    const aLower = a.toLowerCase();
                    const bLower = b.toLowerCase();
                    return aLower < bLower ? -1 : aLower > bLower ? 1 : 0;
                });
            }
        }

        return {

            VariableDeclaration: function VariableDeclaration(node) {
                if (!hasRequire.test(source.getText(node))) return;
                if (isLocalFile.test(source.getText(node))) {
                    if (isError.test(source.getText(node))) {
                        groups.errors.push(node);
                        return;
                    }
                    if (isConstant.test(source.getText(node))) {
                        groups.constants.push(node);
                        return;
                    }
                    if (isFunction.test(source.getText(node))) {
                        groups.functions.push(node);
                        return;
                    }
                    groups.constants.files.push(node);
                } else {
                    groups.modules.push(node);
                    return;
                }
            },

            'Program:exit': function onExit(node) {

            },

        };
    }
};
