import { client, crudService } from "@src/entities/core";
import type { TodoCreateInput, TodoUpdateInput } from "@src/types/models/todo";

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
