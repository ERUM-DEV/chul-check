import { useState, useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { useMemberStore } from '../store/useMemberStore';
import { Member } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { MemberForm } from '../components/member/MemberForm';

const columnHelper = createColumnHelper<Member>();

export function MemberList() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const { members, updateMember } = useMemberStore();

  const columns = useMemo(
    () => [
      columnHelper.accessor('groupName', {
        header: '구역',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('name', {
        header: '이름',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('gender', {
        header: '성별',
        cell: info => info.getValue() === 'M' ? '남' : '여',
      }),
      columnHelper.accessor('generation', {
        header: '세대',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('roles', {
        header: '직분',
        cell: info => info.getValue().join(', '),
      }),
      columnHelper.accessor('attendanceCount', {
        header: '출석 횟수',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('longAbsence', {
        header: '장기결석',
        cell: info => info.getValue() ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
            장기결석
          </span>
        ) : null,
      }),
      columnHelper.display({
        id: 'actions',
        header: '관리',
        cell: props => (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEdit(props.row.original)}
            >
              수정
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleDeleteClick(props.row.original)}
            >
              삭제
            </Button>
          </div>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: members,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (member: Member) => {
    setSelectedMember(member);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedMember) return;

    try {
      await updateMember(selectedMember.id, 'enable', false);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('성도 삭제 실패:', error);
    }
  };

  const handleAddClick = () => {
    setSelectedMember(null);
    setIsFormModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl font-bold">성도 목록</h1>
        <Button onClick={handleAddClick}>성도 추가</Button>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th
                          key={header.id}
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {table.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <td
                          key={cell.id}
                          className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="성도 삭제"
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            정말 {selectedMember?.name} 성도를 삭제하시겠습니까?
          </p>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            취소
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
          >
            삭제
          </Button>
        </div>
      </Modal>

      {/* 성도 추가/수정 폼 */}
      <MemberForm
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        member={selectedMember}
      />
    </div>
  );
} 