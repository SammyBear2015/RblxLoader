import client from "shared/packages/Client/index";
const NoLoad: string[] = [];

// Helper function to check if an item is a table
const TableCheck = (Item: unknown): [boolean, string?] => {
	if (type(Item) === "table") {
		return [true];
	} else {
		return [false, type(Item)];
	}
};

// Helper function to check if an item exists in an array
const arrayContains = (arr: string[], item: string): boolean => {
	return arr.includes(item);
};

const Load = (Script: Record<string, unknown>) => {
	for (const [Index, Table] of pairs(Script)) {
		print(`Processing: ${Index}`);

		if (!arrayContains(NoLoad, Index as string)) {
			const [isTable, itemType] = TableCheck(Table);

			if (isTable) {
				Load(Table as Record<string, unknown>);
			} else if (!isTable && itemType === "function") {
				const Name = Index as string;
				const Code = Table as () => void;

				if (!arrayContains(NoLoad, Name)) {
					print(`Executing: ${Name}`);
					Code();
					print(`Script Loaded: ${Name}`);
				} else {
					print(`Script Skipped: ${Name}`);
				}
			} else {
				print(`Skipped non-function item: ${Index} (${itemType})`);
			}
		} else {
			print(`Script Skipped: ${Index}`);
		}
	}
};

const [Success, Response] = pcall(() => {
	Load(client.Character as unknown as Record<string, unknown>);
});

if (Success) {
	warn("Scripts Loaded");
} else {
	error(`Scripts failed to load: \n\n${Response}\n\n${debug.traceback()}`, 0);
}
