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
        const modules = [];
        const isLocalFile = /\(('|")\./;
        const localFiles = [];
        const isError = /(error|Error)/;
        const errors = [];
        const isConstant = /constants/;
        const constants = [];
        const isFunction = /\((.)+\)\./;
        const functions = [];
        const originalNodes = [];
        const isConstructor = /(?:const |var |let )(?:[A-Za-z_]+ = new)/;
        const constructors = [];

        function sort(a, b) {
            const aLower = source.getText(a).toLowerCase();
            const bLower = source.getText(b).toLowerCase();
            return aLower > bLower;
        }

        function sortIndividualGroups() {
            modules.sort(sort);
            localFiles.sort(sort);
            errors.sort(sort);
            constants.sort(sort);
            functions.sort(sort);
            constructors.sort(sort);
        }

        function compareNodes() {
            const sortedNodes = modules.concat(localFiles).concat(errors).concat(constants).concat(functions);
            if (sortedNodes.length !== originalNodes.length) {
                return;
            }
            let invalidNode;
            sortedNodes.every((u, i) => {
                if (u !== originalNodes[i]) {
                    invalidNode = u;
                    return false;
                }
                return true;
            });
            if (invalidNode) {
                context.report({
                    node: invalidNode,
                    message: 'Required statement found is out of order, reordering elements',
                    fix: function (fixer) {

                    },
                });
            }
        }

        return {
            VariableDeclaration: function VariableDeclaration(node) {
                const nodeText = source.getText(node);
                if (hasRequire.test(nodeText)) {
                    originalNodes.push(node);
                    if (isLocalFile.test(nodeText)) {
                        if (isError.test(nodeText)) {
                            errors.push(node);
                            return;
                        }
                        if (isConstant.test(nodeText)) {
                            constants.push(node);
                            return;
                        }
                        if (isFunction.test(nodeText)) {
                            functions.push(node);
                            return;
                        }
                        localFiles.push(node);
                    } else {
                        modules.push(node);
                    }
                }
                if (isConstructor.test(nodeText)) {
                    originalNodes.push(node);
                    constructors.push(node);
                }
            },

            'Program:exit': function onExit(node) {
                sortIndividualGroups();
                compareNodes();
            },

        };
    }
};
