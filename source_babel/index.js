const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const types = require('@babel/types');

const source = `
    console.log(1);

    function func() {
        console.info(2);
    }

    export default class Clazz {
        say() {
            console.debug(3);
        }
        render() {
            return <div>{console.error(4)}</div>
        }
    }
`;

const ast = parser.parse(source, {
  sourceType: 'unambiguous',
  plugins: ['jsx']
});

traverse(ast, {
  CallExpression(path, state) {
    if (types.isMemberExpression(path.node.callee)
      && path.node.callee.object.name === 'console' 
      && ['log', 'info', 'error', 'debug'].includes(path.node.callee.property.name)) {
      path.node.arguments.unshift(types.stringLiteral('prefix: '));
    }
  }
});

const { code } = generate(ast);

console.log(JSON.stringify(code, null, 2));
