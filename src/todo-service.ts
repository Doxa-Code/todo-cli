import { Database } from "beta.db";
import inquirer from "inquirer";
import { Task } from "./task";

export class TodoService {
	private database = new Database("todos.json");
	private PRIORIRIES = {
		1: "🔥",
		2: "🚨",
		3: "📤",
		4: "🗑️",
	};

	private fetchAllTodo() {
		const tasks = new Map<string, Task>();
		Object.entries(this.database.all()).map(([id, task]) =>
			tasks.set(id, Task.instance(task)),
		);
		return tasks;
	}

	async addTask(callback?: () => Promise<void>) {
		const response = await inquirer.prompt([
			{
				type: "input",
				message: "Descrição: ",
				name: "title",
			},
			{
				type: "list",
				message: "Prioridade: ",
				name: "priority",
				choices: [
					{ name: "🔥 Prioridade 1", value: 1 },
					{ name: "🚨 Prioridade 2", value: 2 },
					{ name: "📤 Prioridade 3", value: 3 },
					{ name: "🗑️  Prioridade 4", value: 4 },
				],
			},
		]);

		const task = Task.create(response.title, response.priority);

		this.database.set(task.id, task);

		if (callback) {
			await callback();
			return;
		}

		console.log("\n✅ Tarefa adicionada com sucesso.\n");
	}

	async list() {
		const tasks = this.fetchAllTodo();

		console.clear();

		const choices = Array.from(tasks.values())
			.sort((ta, tb) => (ta.priority > tb.priority ? 1 : -1))
			.map((task) => ({
				name: `${task.status === "done" ? "✅" : "⬜"} ${task.title} ${this.PRIORIRIES[task.priority]}`,
				value: task.id,
			}));

		const { selectedTask, action } = await inquirer.prompt([
			{
				type: "list",
				name: "selectedTask",
				message:
					"Selecione uma tarefa para gerenciar (pressione Enter para escolher):",
				choices: [
					{ name: "Adicionar tarefa", value: "new" },
					...choices,
					{ name: "Sair", value: "exit" },
				],
				loop: false,
			},
			{
				type: "list",
				name: "action",
				message: "",
				choices: [
					{ name: "Concluído ✅", value: "complete" },
					{ name: "Inbox 📥", value: "inbox" },
					{ name: "Remover ❌", value: "remove" },
					{ name: "Voltar", value: "cancel" },
				],
				when({ selectedTask }) {
					return selectedTask !== "exit" && selectedTask !== "new";
				},
			},
		]);

		if (selectedTask === "new") {
			this.addTask(this.list.bind(this));
			return;
		}

		if (selectedTask === "exit") {
			console.log("\n✅ Feito\n");
			return;
		}

		switch (action) {
			case "complete": {
				const task = tasks.get(selectedTask);

				if (!task) break;

				task.done();

				this.database.set(task.id, task);
				this.list();

				break;
			}

			case "inbox": {
				const task = tasks.get(selectedTask);

				if (!task) break;

				task.inbox();

				this.database.set(task.id, task);
				this.list();

				break;
			}

			case "remove": {
				this.database.deleteEach(selectedTask);
				this.list();
				break;
			}
			case "cancel":
				this.list();
				break;
		}
	}

	static create() {
		return new TodoService();
	}
}
