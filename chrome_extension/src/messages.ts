export type Message =
  | {
      type: "createTab";
      url: string;
    }
  | {
      type: "requestAnki";
      typ: string;
      target: string;
    };
