import page from "page";
import { Action } from "overmind";
import * as queryString from "querystring";

export const router = {
  route(route: string, action: Action) {
    page(route, ({ params, querystring }) => {
      const payload = Object.assign({}, params, queryString.parse(querystring));
      action(payload);
    });
  },
  start: () => page.start({ hashbang: true }),
  open: (path: string) => page.show(path),
};
