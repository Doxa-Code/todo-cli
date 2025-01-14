#!/usr/bin/env bun
import fs from "node:fs";
import { resolve } from "node:path";
import inquirer from "inquirer";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

// Defina o caminho para o arquivo todo.md
const TODO_FILE = resolve(`${process.cwd()}/todo.md`);

// Função para criar o arquivo todo.md, se não existir
const createTodoFile = () => {
	if (!fs.existsSync(TODO_FILE)) {
		fs.writeFileSync(TODO_FILE, "# Todo`s\n\n");
		console.log("Arquivo todo.md criado.\n");
	}
};

// Função para adicionar uma tarefa ao arquivo todo.md
const addTask = (task: string) => {
	if (!task) {
		console.log("Por favor, forneça uma tarefa para adicionar.\n");
		return;
	}

	// Adiciona a tarefa no arquivo todo.md
	fs.appendFileSync(TODO_FILE, `- [ ] ${task}\n`);
	console.log(`Tarefa '${task}' adicionada com sucesso.\n`);
};

const list = async () => {
	if (!fs.existsSync(TODO_FILE)) {
		console.log("Arquivo todo.md não encontrado.\n");
		return;
	}

	// Lê o conteúdo do arquivo e encontra as tarefas pendentes
	const tasks = fs
		.readFileSync(TODO_FILE, "utf-8")
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

	if (updatedTasks.length <= 0) {
		return console.log("Nenhum tarefa concluída\n");
	}

	choices.map((task) => {
		const taskDone = updatedTasks.includes(task.value);

		const updatedTask = taskDone
			? task.value.replace("- [ ]", "- [x]")
			: task.value.replace("- [x]", "- [ ]");

		const fileContent = fs.readFileSync(TODO_FILE, "utf-8");
		const newContent = fileContent.replace(task.value, updatedTask);
		fs.writeFileSync(TODO_FILE, newContent);
	});

	console.log(`${updatedTasks.length} tarefas concluídas\n`);
};

const removeTasks = async () => {
	if (!fs.existsSync(TODO_FILE)) {
		console.log("Arquivo todo.md não encontrado.\n");
		return;
	}

	// Lê o conteúdo do arquivo e encontra as tarefas pendentes
	const tasks = fs
		.readFileSync(TODO_FILE, "utf-8")
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
					checked: " [x]",
					unchecked: " [ ]",
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
			const fileContent = fs.readFileSync(TODO_FILE, "utf-8");
			const newContent = fileContent.replace(`\n${task.value}`, "");
			fs.writeFileSync(TODO_FILE, newContent);
		}
	});

	console.log(`${updatedTasks.length} tarefas removidas\n`);
};

yargs(hideBin(process.argv))
	.scriptName("todo")
	.demandCommand()
	.command({
		command: "add",
		describe: "Adicionar uma tarefa",
		handler(argv) {
			createTodoFile();
			addTask(argv._.slice(1).join(" ") as string);
		},
	})
	.command({
		command: "ls",
		describe: "Listar todas as tarefas",
		handler() {
			createTodoFile();
			list();
		},
	})
	.command({
		command: "rm",
		describe: "Remover tarefas",
		handler() {
			createTodoFile();
			removeTasks();
		},
	})
	.version("v1.0.0")
	.help()
	.alias("-h", "help")
	.wrap(null)
	.showHelpOnFail(true, " ")
	.parse();
