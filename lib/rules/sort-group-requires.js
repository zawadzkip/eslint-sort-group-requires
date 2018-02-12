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
        const isError = /(error|Error)/;
        const isConstant = /constants/;
        const groups = {
            modules: [],
            constants: [],
            errors: [],
            files: [],
            functions: [],
            remaining: [],
        };

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        // any helper functions should go here or else delete this section

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------

        return {

            VariableDeclaration: function VariableDeclaration(node) {
                if (!hasRequire.test(source.getText(node))) return;
                if (!isLocalFile.test(source.getText(node))) {
                    groups.modules.push(node);
                    return;
                } else {
                    if (isError.test(source.getText(node))) {
                        groups.errors.push(node);
                        return;
                    }
                    if (isConstant.test(source.getText(node))) {
                        groups.constants.push(node);
                    }
                }

            },

        };
    }
};
