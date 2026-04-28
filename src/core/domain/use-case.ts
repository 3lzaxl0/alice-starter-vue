/**
 * Base interface for all use cases.
 * @template Input The input parameters for the use case.
 * @template Output The return type of the use case.
 */
export interface UseCase<Input, Output> {
  execute(param: Input): Promise<Output> | Output
}
