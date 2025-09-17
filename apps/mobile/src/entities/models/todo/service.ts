import { client, crudService } from "@src/entities/core";

interface TodoCreateInput {
    title: string;
    completed?: boolean;
}

type TodoUpdateInput = Partial<TodoCreateInput>;

export const todoService = crudService<
    "Todo",
    TodoCreateInput,
    TodoUpdateInput & { id: string },
    { id: string },
    { id: string }
>("Todo", {
    auth: { read: ["apiKey", "userPool"], write: "userPool" },
});

export function useTodoService() {
    return client.models.Todo;
}
