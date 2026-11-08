import type { NodePath } from '@babel/traverse';
import type { Expression, IfStatement } from '@babel/types';
import { defineConfig } from 'father';

/** `(import.meta as any)` 这类 TS 包装，visit `IfStatement` 时还没被剥掉 */
function unwrapTS(node: Expression): Expression {
  let n = node;
  while (
    n &&
    (n.type === 'TSAsExpression' ||
      n.type === 'TSTypeAssertion' ||
      n.type === 'TSNonNullExpression' ||
      n.type === 'ParenthesizedExpression')
  ) {
    n = n.expression;
  }
  return n;
}

/** `typeof import.meta.hot === 'object'` */
function isViteHotTest(node: Expression | undefined) {
  if (
    node?.type === 'BinaryExpression' &&
    (node.operator === '===' || node.operator === '==') &&
    node.right.type === 'StringLiteral' &&
    node.right.value === 'object' &&
    node.left.type === 'UnaryExpression' &&
    node.left.operator === 'typeof' &&
    node.left.argument.type === 'MemberExpression' &&
    node.left.argument.property.type === 'Identifier' &&
    node.left.argument.property.name === 'hot'
  ) {
    const object = unwrapTS(node.left.argument.object);

    return (
      object.type === 'MetaProperty' &&
      object.meta.type === 'Identifier' &&
      object.meta.name === 'import' &&
      object.property.type === 'Identifier' &&
      object.property.name === 'meta'
    );
  }

  return false;
}

/**
 * `import.meta` is only valid in ESM. In CJS output it is a syntax error on
 * Node < 20, so the Vite HMR branch is useless there anyway: drop the whole
 * `if (typeof import.meta.hot === 'object') {}` statement (main `if` or
 * `else if`, both are removed) and keep the webpack one.
 *
 * Any `import.meta` left in CJS output fails the build instead of producing
 * a package which crashes on `require`.
 */
function stripViteHMR() {
  return {
    name: 'strip-vite-hmr',
    visitor: {
      IfStatement(path: NodePath<IfStatement>) {
        if (isViteHotTest(path.node.test)) {
          path.remove();
        }
      },
    },
  };
}

export default defineConfig({
  plugins: ['@rc-component/father-plugin'],
  cjs: {
    extraBabelPlugins: [stripViteHMR],
  },
  umd: {
    name: 'antdCssinjs',
    externals: {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
    extraBabelPlugins: [stripViteHMR],
  },
});
