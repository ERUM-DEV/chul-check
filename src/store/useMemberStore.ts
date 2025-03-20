import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Member, FilterOptions } from '../types'

interface MemberState {
  members: Member[];
  filteredMembers: Member[];
  filterOptions: FilterOptions;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchMembers: () => Promise<void>;
  addMember: (member: Omit<Member, 'id' | 'enable' | 'attendanceCount'>) => Promise<void>;
  updateMember: (id: string, field: keyof Member, value: any) => Promise<void>;
  setFilterOptions: (options: Partial<FilterOptions>) => void;
}

export const useMemberStore = create<MemberState>()(
  devtools(
    (set, get) => ({
      members: [],
      filteredMembers: [],
      filterOptions: {
        searchText: '',
        groupFilter: 'all',
        showLongAbsence: false,
        generationFilter: 'all',
        roleFilter: 'all',
      },
      isLoading: false,
      error: null,

      fetchMembers: async () => {
        console.log('useMemberStore: Starting to fetch members...')
        set({ isLoading: true, error: null })
        try {
          const members = await window.electronAPI.getAllMembers()
          console.log('useMemberStore: Raw members data:', members)
          
          // Process the members data
          const processedMembers = members.map((member: any) => ({
            ...member,
            roles: member.roles.split(',')
          }))
          console.log('useMemberStore: Processed members data:', processedMembers)
          
          set({ 
            members: processedMembers,
            filteredMembers: processedMembers,
            isLoading: false 
          })
          console.log('useMemberStore: State updated with members')
        } catch (error) {
          console.error('useMemberStore: Error fetching members:', error)
          set({ error: 'Failed to fetch members', isLoading: false })
        }
      },

      addMember: async (member) => {
        try {
          console.log('Adding new member:', member);
          await window.electronAPI.addMember(member)
          console.log('Member added successfully');
          await get().fetchMembers()
        } catch (error) {
          console.error('Error adding member:', error);
          throw error;
        }
      },

      updateMember: async (id: string, field: keyof Member, value: any) => {
        try {
          console.log('Updating member:', { id, field, value });
          const member = get().members.find(m => m.id === id)
          if (!member) throw new Error('성도를 찾을 수 없습니다.')
          
          const oldValue = member[field]
          await window.electronAPI.updateMember(id, field, value, oldValue)
          console.log('Member updated successfully');
          await get().fetchMembers()
        } catch (error) {
          console.error('Error updating member:', error);
          throw error;
        }
      },

      setFilterOptions: (options) => {
        console.log('Setting filter:', { options });
        const currentOptions = get().filterOptions
        const newOptions = { ...currentOptions, ...options }
        set({ filterOptions: newOptions })
        
        const { members } = get()
        let filtered = [...members]
        
        // 검색어로 필터링
        if (newOptions.searchText) {
          const searchLower = newOptions.searchText.toLowerCase()
          filtered = filtered.filter(member => 
            member.name.toLowerCase().includes(searchLower) ||
            member.groupName.toLowerCase().includes(searchLower)
          )
        }
        
        // 구역으로 필터링
        if (newOptions.groupFilter !== 'all') {
          filtered = filtered.filter(member => 
            member.groupName === newOptions.groupFilter
          )
        }
        
        // 세대로 필터링
        if (newOptions.generationFilter !== 'all') {
          filtered = filtered.filter(member => 
            member.generation === newOptions.generationFilter
          )
        }
        
        // 직분으로 필터링
        if (newOptions.roleFilter !== 'all') {
          filtered = filtered.filter(member => 
            member.roles.includes(newOptions.roleFilter)
          )
        }
        
        // 장기결석자 필터링
        if (newOptions.showLongAbsence) {
          filtered = filtered.filter(member => member.longAbsence)
        }
        
        set({ filteredMembers: filtered })
      },
    }),
    { name: 'member-store' }
  )
) 