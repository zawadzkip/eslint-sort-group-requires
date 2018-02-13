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
        fixable: "code",
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
        let startNode = null;
        let endNode = null;
        let replacementText = '';
        const groups = {
            modules: [],
            constants: [],
            errors: [],
            files: [],
            functions: [],
            remaining: [],
        };

        function sortGroupsAndCreateText() {
            for (const key in groups) {
                if (!groups.hasOwnProperty(key)) {
                    continue;
                }

                let groupTextArray;
                groups[key].forEach((item) => {
                    groupTextArray.push(source.getText(item));

                    if (startNode) {
                        startNode = startNode.start > item.start ? item : startNode;
                    } else {
                        startNode = item;
                    }
                    if (endNode) {
                        endNode = endNode.start < item.start ? item : endNode;
                    } else {
                        endNode = item;
                    }
                });

                groupTextArray.sort((a, b) => {
                    const aLower = a.toLowerCase();
                    const bLower = b.toLowerCase();
                    return aLower < bLower ? -1 : aLower > bLower ? 1 : 0;
                });
                if (groupTextArray.length) {
                    replacementText += groupTextArray.join('\n') + '\n';
                }

            }
        }

        function replaceText() {
            if (startNode && endNode) {
                context.report({
                    loc: {
                        start: startNode.loc.start,
                        end: endNode.loc.end,
                    },
                    message: 'The requires statements are improperly sorted',
                    fix: function fix (fixer) {
                        return fixer.replaceTextRange([startNode.start, endNode.end], replacementText);
                    },
                });
            }
        }


        return {

            VariableDeclaration: function VariableDeclaration(node) {
                if (!hasRequire.test(source.getText(node))) {
                    groups.remaining.push(node);
                    return;
                }
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
                sortGroupsAndCreateText();
                replaceText();
            },

        };
    }
};
