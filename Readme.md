# Validator
This utility implements functionality for validation of incoming arguments and response from the server according to the scheme.
Any nesting of schema and data is supported

## Пример использования
```ts
function testResponse(){
  const schema = {
    id: 0,
    title: '',
    data: [
      { id: 0, is_locked: true }, // variant 1
      { id: 0, is_locked: false, title: '' }, // variant 2
    ]
  }

  const responseValidator = new Validator(schema)

  request('/api/example')
    .then((res) => res.json())
    .then(responseValidator.validate)
    .catch(err => {
      console.log(err)
      // If a validation error occurred, the message will look like this

      // Error: {
      //   "message": "Данные не соответствуют требуемым",
      //   "path": "step_step_step",
      //   "detail" {
      //     expected: 0,
      //     expectedType: 'number',
      //     received: 'joijoi',
      //     receivedType: 'string',
      //   },
      //   "schema": {
      //     id: 0,
      //     title: '',
      //     data: [
      //       { id: 0, is_locked: true },
      //       { id: 0, is_locked: false, title: '' },
      //     ]
      //   },
      //   "response": {
      //     "id": 12312,
      //     "data": {
      //       "list": [
      //         {
      //           "id": 1,
      //           "title": "joijiojoijioj"
      //         },
      //         {
      //           "id": 1,
      //           "title": []
      //         }
      //       ]
      //     }
      //   }
      // }
    })
}
```

## Schema
number - any number, the check is of the type
string - any string, the check is of the type
object - any object, the check is of the type, key types and value types
boolean - any boolean, the check is of the type
array - any value if the variant elements in the array are only 1. Each element in the schema array is a variant of the elements in the array.