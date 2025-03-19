import { useState, useEffect } from 'react';
import { Member } from '../../types';
import { useMemberStore } from '../../store/useMemberStore';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface MemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  member?: Member | null;
}

interface FormData {
  groupName: string;
  name: string;
  birthDate: string;
  gender: 'M' | 'F';
  joinedDate: string;
  generation: string;
  roles: string[];
  longAbsence: boolean;
  longAbsenceReason?: string;
}

const GENERATIONS = [
  { value: '1세대', label: '1세대' },
  { value: '2세대', label: '2세대' },
  { value: '3세대', label: '3세대' },
  { value: '새신자', label: '새신자' },
];

const ROLES = [
  { value: '성도', label: '성도' },
  { value: '집사', label: '집사' },
  { value: '권사', label: '권사' },
  { value: '장로', label: '장로' },
  { value: '목사', label: '목사' },
];

const GROUPS = [
  { value: '1구역', label: '1구역' },
  { value: '2구역', label: '2구역' },
  { value: '3구역', label: '3구역' },
  { value: '4구역', label: '4구역' },
  { value: '5구역', label: '5구역' },
];

export function MemberForm({ isOpen, onClose, member }: MemberFormProps) {
  const { addMember, updateMember } = useMemberStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<FormData>({
    groupName: '',
    name: '',
    birthDate: '',
    gender: 'M',
    joinedDate: new Date().toISOString().split('T')[0],
    generation: '새신자',
    roles: ['성도'],
    longAbsence: false,
    longAbsenceReason: '',
  });

  useEffect(() => {
    if (member) {
      setFormData({
        groupName: member.groupName,
        name: member.name,
        birthDate: member.birthDate || '',
        gender: member.gender,
        joinedDate: member.joinedDate,
        generation: member.generation,
        roles: member.roles,
        longAbsence: member.longAbsence,
        longAbsenceReason: member.longAbsenceReason || '',
      });
    } else {
      setFormData({
        groupName: '',
        name: '',
        birthDate: '',
        gender: 'M',
        joinedDate: new Date().toISOString().split('T')[0],
        generation: '새신자',
        roles: ['성도'],
        longAbsence: false,
        longAbsenceReason: '',
      });
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (member) {
        // 수정
        for (const [key, value] of Object.entries(formData)) {
          if (value !== member[key as keyof Member]) {
            await updateMember(member.id, key as keyof Member, value);
          }
        }
      } else {
        // 추가
        await addMember(formData);
      }
      onClose();
    } catch (err) {
      setError('성도 정보 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    field: keyof FormData,
    value: string | string[] | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={member ? '성도 정보 수정' : '새 성도 추가'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="구역"
          options={GROUPS}
          value={formData.groupName}
          onChange={e => handleChange('groupName', e.target.value)}
          required
        />

        <Input
          label="이름"
          value={formData.name}
          onChange={e => handleChange('name', e.target.value)}
          required
        />

        <Input
          label="생년월일"
          type="date"
          value={formData.birthDate}
          onChange={e => handleChange('birthDate', e.target.value)}
        />

        <Select
          label="성별"
          options={[
            { value: 'M', label: '남' },
            { value: 'F', label: '여' },
          ]}
          value={formData.gender}
          onChange={e => handleChange('gender', e.target.value as 'M' | 'F')}
          required
        />

        <Input
          label="등록일"
          type="date"
          value={formData.joinedDate}
          onChange={e => handleChange('joinedDate', e.target.value)}
          required
        />

        <Select
          label="세대"
          options={GENERATIONS}
          value={formData.generation}
          onChange={e => handleChange('generation', e.target.value)}
          required
        />

        <Select
          label="직분"
          options={ROLES}
          value={formData.roles[0]}
          onChange={e => handleChange('roles', [e.target.value])}
          required
        />

        {member?.longAbsence && (
          <>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="longAbsence"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.longAbsence}
                onChange={e => handleChange('longAbsence', e.target.checked)}
              />
              <label htmlFor="longAbsence" className="ml-2 block text-sm text-gray-900">
                장기결석
              </label>
            </div>

            {formData.longAbsence && (
              <Input
                label="장기결석 사유"
                value={formData.longAbsenceReason}
                onChange={e => handleChange('longAbsenceReason', e.target.value)}
              />
            )}
          </>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
          >
            {member ? '수정' : '추가'}
          </Button>
        </div>
      </form>
    </Modal>
  );
} 