/**
 * Injects a method.
 * 
 * @param {function} func The function to inject.
 * @param {any} thisArg The object or value to bind the function to when calling.
 */
module.exports = function inject(func, thisArg = {}) {
    let before = [];
    let mods = [];
    let outputTransformers = [];
    let after = [];

    let wrapped = function () {
        let args = Array.prototype.slice.call(arguments);

        before.forEach(cb => cb(args));

        mods.forEach(mod => {
            if (mod.index >= args.length) {
                return;
            };

            args[mod.index] = mod.transformer(args[mod.index]);
        });

        let returnValue = func.apply(thisArg, args);

        outputTransformers.forEach(transformer => {
            returnValue = transformer(returnValue);
        });

        after.forEach(cb => cb(returnValue, args));

        return returnValue;
    };

    return Object.assign(wrapped, {
        /**
         * Transforms the argument at the given index.
         * 
         * @param {number} index The index to transform.
         * @param {(value: any) => any} transformer The transformer callback.
         */
        transform(index, transformer) {
            mods.push({ index, transformer });
            return this;
        },
        /**
         * Transforms the output of the argument.
         * 
         * @param {(output: any) => any} transformer The transformer callback.
         */
        transformOutput(transformer) {
            outputTransformers.push(transformer);
            return this;
        },
        /**
         * Runs the given callback before the method runs, and before argument transformers apply.
         * 
         * @param {(args: any) => any} callback The callback.
         */
        before(callback) {
            before.push(callback);
            return this;
        },
        /**
         * Runs the given callback after the method runs, and after output transformers apply.
         * 
         * @param {(args: any) => any} callback The callback.
         */
        after(callback) {
            after.push(callback);
            return this;
        }
    });
};