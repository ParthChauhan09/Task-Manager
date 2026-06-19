import { Priority } from "../../types";
import { OrgDialog, DateDialog, MoveTaskDateDialog, TaskDialog, ConfirmDialog } from "../Dialogs";
import { OrgDialogState, TaskDialogState, ConfirmDialogState, MoveTaskDateDialogState } from "../../hooks/useDashboard";

interface DashboardDialogsProps {
    orgDialog: OrgDialogState;
    setOrgDialog: (s: OrgDialogState) => void;
    dateDialog: { isOpen: boolean };
    setDateDialog: (s: { isOpen: boolean }) => void;
    moveTaskDateDialog: MoveTaskDateDialogState;
    setMoveTaskDateDialog: (s: MoveTaskDateDialogState) => void;
    taskDialog: TaskDialogState;
    setTaskDialog: (s: TaskDialogState) => void;
    confirmDialog: ConfirmDialogState;
    setConfirmDialog: (s: ConfirmDialogState) => void;
    onSubmitOrg: (name: string) => void;
    onSubmitDate: (date: string) => void;
    onSubmitMoveTaskDate: (date: string) => void;
    onSubmitTask: (fields: { title: string; description: string; date: string; priority: Priority }) => void;
}

export function DashboardDialogs({
    orgDialog, setOrgDialog,
    dateDialog, setDateDialog,
    moveTaskDateDialog, setMoveTaskDateDialog,
    taskDialog, setTaskDialog,
    confirmDialog, setConfirmDialog,
    onSubmitOrg, onSubmitDate, onSubmitMoveTaskDate, onSubmitTask,
}: DashboardDialogsProps) {
    return (
        <>
            <OrgDialog
                isOpen={orgDialog.isOpen}
                onClose={() => setOrgDialog({ isOpen: false, isEdit: false })}
                onSubmit={onSubmitOrg}
                initialValue={orgDialog.initialName}
                isEdit={orgDialog.isEdit}
            />

            <DateDialog
                isOpen={dateDialog.isOpen}
                onClose={() => setDateDialog({ isOpen: false })}
                onSubmit={onSubmitDate}
            />

            <MoveTaskDateDialog
                isOpen={moveTaskDateDialog.isOpen}
                onClose={() => setMoveTaskDateDialog({ isOpen: false })}
                onSubmit={onSubmitMoveTaskDate}
                taskTitle={moveTaskDateDialog.taskTitle}
                initialDate={moveTaskDateDialog.initialDate}
            />

            <TaskDialog
                isOpen={taskDialog.isOpen}
                onClose={() => setTaskDialog({ isOpen: false, isEdit: false })}
                onSubmit={onSubmitTask}
                initialValues={
                    taskDialog.isEdit
                        ? taskDialog.initialValues
                        : taskDialog.prepopulatedDate
                            ? { title: "", date: taskDialog.prepopulatedDate, priority: "medium" }
                            : undefined
                }
                isEdit={taskDialog.isEdit}
            />

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
            />
        </>
    );
}
