configs = {
    'default_dir' : 'Luogu',
    'default_language' : 'cpp',
    'patterns' : {
        'c' : 'pattern.c',
        'cpp' : 'pattern.cpp',
    }, 
    'compile_command' : {
        'c' : 'gcc {problem}.c -o {problem}.exe',
        'cpp' : 'g++ {problem}.cpp -o {problem}.exe -DONLINE_JUDGE -Wall -fno-asm -lm -march=native',
    },
    "diff_command" : "diff {problem}.out {problem}.ans",
}