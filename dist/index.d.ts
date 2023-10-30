export type ValidatorMessageParsed = {
    message: string;
    path: string;
    schema: unknown;
    response: unknown;
    detail: {
        name: string;
        expected: unknown;
        expectedType: string;
        received: unknown;
        receivedType: string;
    };
};
export default class Validator<T> {
    private schema;
    constructor(schema: unknown);
    static dialog(err: Error, url?: string): {
        title: string;
        subTitle: string;
    };
    private createError;
    private isEqualType;
    private isDeepStructure;
    validate: (response: unknown, _schema?: unknown, path?: string) => T;
}
