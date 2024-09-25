declare module 'interlinear' {
  // Add extension types exposed on the papi for other extensions to use here
  // More instructions can be found in the README
}

declare module 'papi-shared-types' {
  export interface CommandHandlers {
    'interlinear.getLanguagesFromDatabase': (input: string) => Promise<string[]>;
  }
}
