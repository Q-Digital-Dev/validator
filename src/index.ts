const ERROR_MESSAGE = 'Данные не соответствуют требуемым'

export type ValidatorMessageParsed = {
  message: string
  path: string
  schema: unknown
  response: unknown
  detail: {
    name: string
    expected: unknown
    expectedType: string
    received: unknown
    receivedType: string
  }
}

export default class Validator<T> {
  constructor(private schema: unknown) { }

  static dialog(err: Error, url?: string) {
    const data: ValidatorMessageParsed = JSON.parse(err.message)
    return {
      title: "Ошибка сервера",
      subTitle: `${url ? `${url}\n` : ''}${data.path}\nОжидалось: (${data.detail.expectedType})\nПолучено: (${data.detail.receivedType})`
    }
  }

  private createError = (path: string, schema: unknown, response: unknown) => {
    return JSON.stringify({
      message: ERROR_MESSAGE,
      path,
      schema,
      response: response === undefined ? 'undefined' : response,
    }, undefined, 2)
  }

  private isEqualType = (req: unknown, res: unknown) => {
    if (
      typeof req !== typeof res
      || typeof req === 'object' && Array.isArray(req) && !Array.isArray(res)
    ) {
      return false
    }

    return true
  }

  private isDeepStructure = (req: unknown) => {
    return typeof req === 'object'
  }

  validate = (response: unknown, _schema: unknown = this.schema, path = 'root'): T => {
    try {
      if (!this.isEqualType(_schema, response)) {
        throw new Error(this.createError(path, _schema, response))
      }

      if (this.isDeepStructure(_schema)) {
        if (Array.isArray(_schema)) { // array
          const schema: Array<unknown> = _schema as any // variants
          const res: Array<unknown> = response as any

          for (let index = 0; index < res.length; index++) {
            // check the variants of entities in the array scheme
            let errors: string[] = []
            if (!schema.filter((variant) => {
              try {
                if (!this.isEqualType(variant, res[index])) {
                  throw new Error(this.createError(`${path}-${index}`, schema, response))
                }

                if (this.isDeepStructure(res[index])) {
                  new Validator(variant).validate(res[index], variant, `${path}-${index}`)
                }

                return true
              } catch (error) {
                errors.push((error as Error).message)
                return false
              }
            }).length) {
              if (errors.length && errors[0]) {
                throw new Error(this.createError(JSON.parse(errors[0]).path, schema, response))
              }
              else {
                throw new Error(this.createError(`${path}-${index}`, schema, response))
              }
            }
          }
        }
        else { // object
          const schema: Record<string, unknown> = _schema as any
          const res: Record<string, unknown> = response as any

          for (const key in schema) {
            if (!this.isEqualType(schema[key], res[key])) {
              throw new Error(this.createError(`${path}-${key}`, schema, res))
            }

            if (this.isDeepStructure(schema[key])) {
              try {
                new Validator(schema[key]).validate(res[key], schema[key], `${path}-${key}`)
              } catch (error) {
                throw new Error(this.createError(JSON.parse((error as Error).message).path, schema, res))
              }
            }
          }
        }
      }

      return response as T
    } catch (error) {
      if (path === 'root') {
        const message = JSON.parse((error as Error).message)
        const _path = message.path
        if (_path) {
          const split = _path.split('-')
          let expected: any = this.schema,
            received: any = response,
            name = 'root';

          for (let index = 0; index < split.length; index++) {
            const key = split[index];
            if (key === 'root') {
              continue
            }

            expected = expected[key]
            received = received[key]
            name = key
          }

          message.detail = {
            name,
            expected,
            expectedType: typeof expected === 'object' ? Array.isArray(expected) ? 'array' : 'object' : typeof expected,
            received,
            receivedType: typeof received === 'object' ? Array.isArray(received) ? 'array' : 'object' : typeof received,
          }

          throw new Error(JSON.stringify(message))
        }
      }

      throw error
    }
  }
}