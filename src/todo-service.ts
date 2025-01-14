import fs from "node:fs";
import { resolve } from "node:path";
import inquirer from "inquirer";
import type { Task } from "./task";

export class TodoService {
	private TODO_FILE = resolve(`${process.cwd()}/todo.md`);

	constructor() {
		if (!fs.existsSync(this.TODO_FILE)) {
			fs.writeFileSync(this.TODO_FILE, "# Todo`s\n\n");
			console.log("Arquivo todo.md criado.\n");
		}
	}

	addTask(task: Task) {
		if (!task) {
			console.log("Por favor, forneça uma tarefa para adicionar.\n");
			return;
		}

		const tasks = fs
			.readFileSync(this.TODO_FILE, "utf-8")
			.split("\n")
			.filter((line) => line.includes("- [ ]") || line.includes("- [x]"))
			.map((task) => task.replace("- [ ] ", "").replace("- [x] ", ""));

		if (tasks.includes(task.title)) {
			console.log("\nTarefa já adicionada!\n");
			return;
		}

		fs.appendFileSync(this.TODO_FILE, `- [ ] ${task.title}\n`);

		console.log(`Tarefa '${task.title}' adicionada com sucesso.\n`);
	}

	async list() {
		const tasks = fs
			.readFileSync(this.TODO_FILE, "utf-8")
			.split("\n")
			.filter((line) => line.includes("- [ ]") || line.includes("- [x]"));

		if (tasks.length === 0) {
			console.log("Nenhuma tarefa encontrada.\n");
			return;
		}

		const choices = tasks.map((task) => ({
			name: task.replace("- [ ] ", "").replace("- [x] ", ""),
			value: task,
			checked: task.includes("- [x]"),
		}));

		console.clear();

		const answers: { tasksDone: string[] } = await inquirer.prompt([
			{
				type: "checkbox",
				name: "tasksDone",
				message: "Selecione as tarefas concluídas:\n",
				theme: {
					icon: {
						checked: " [x]",
						unchecked: " [ ]",
						cursor: ">",
					},
				},
				instructions: false,
				choices,
			},
		]);

		const updatedTasks = answers.tasksDone;

		choices.map((task) => {
			const taskDone = updatedTasks.includes(task.value);

			const updatedTask = taskDone
				? task.value.replace("- [ ]", "- [x]")
				: task.value.replace("- [x]", "- [ ]");

			const fileContent = fs.readFileSync(this.TODO_FILE, "utf-8");
			const newContent = fileContent.replace(task.value, updatedTask);
			fs.writeFileSync(this.TODO_FILE, newContent);
		});

		console.log(`${updatedTasks.length} tarefas concluídas\n`);
	}

	async removeTask() {
		if (!fs.existsSync(this.TODO_FILE)) {
			console.log("Arquivo todo.md não encontrado.\n");
			return;
		}

		// Lê o conteúdo do arquivo e encontra as tarefas pendentes
		const tasks = fs
			.readFileSync(this.TODO_FILE, "utf-8")
			.split("\n")
			.filter((line) => line.includes("- [ ]") || line.includes("- [x]"));

		if (tasks.length === 0) {
			console.log("Nenhuma tarefa encontrada.\n");
			return;
		}

		const choices = tasks.map((task) => ({
			name: task.replace("- [ ] ", "").replace("- [x] ", ""),
			value: task,
		}));

		console.clear();

		const answers: { taskToRemove: string[] } = await inquirer.prompt([
			{
				type: "checkbox",
				name: "taskToRemove",
				message: "Selecione as tarefas a serem removidas:\n",
				theme: {
					icon: {
						checked: " x",
						unchecked: " -",
						cursor: ">",
					},
				},
				instructions: false,
				choices,
			},
		]);

		const updatedTasks = answers.taskToRemove;

		if (updatedTasks.length <= 0) {
			return console.log("Nenhum tarefa removida\n");
		}

		choices.map((task) => {
			const taskRemove = updatedTasks.includes(task.value);
			if (taskRemove) {
				const fileContent = fs.readFileSync(this.TODO_FILE, "utf-8");
				const newContent = fileContent.replace(`\n${task.value}`, "");
				fs.writeFileSync(this.TODO_FILE, newContent);
			}
		});

		console.log(`${updatedTasks.length} tarefas removidas\n`);
	}

	static create() {
		return new TodoService();
	}
}
