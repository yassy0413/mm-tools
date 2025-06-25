export class Api {
  static API_URL = "https://api.mentemori.icu";

  static async Request(path) {
    try {
      const response = await fetch(`${this.API_URL}/${path}`);

      if (!response.ok) {
        //todo: error handling
        throw new Error("Api Error");
      }

      return await response.json();
    } catch (error) {
      console.error(error);
    }
  }

  static async Requests(paths) {
    try {
      const responses = await Promise.all(
        paths.map((path) => fetch(`${this.API_URL}/${path}`))
      );

      if (responses.some((response) => !response.ok)) {
        //todo: error handling
        throw new Error("Api Error");
      }

      return await Promise.all($.map(responses, (response) => response.json()));
    } catch (error) {
      console.error(error);
    }
  }
}
