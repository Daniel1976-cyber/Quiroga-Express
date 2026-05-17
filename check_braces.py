with open('romero.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

stack = []
in_string = False
string_char = ''

for i, line in enumerate(lines):
    # Ignorar comentarios de una línea en JS
    clean_line = line.split('//')[0]
    
    for char in clean_line:
        if char in ["'", '"', '`']:
            if not in_string:
                in_string = True
                string_char = char
            elif string_char == char:
                in_string = False
        
        if not in_string:
            if char == '{':
                stack.append(i + 1)
            elif char == '}':
                if not stack:
                    print(f"Extra '}}' at line {i + 1}")
                else:
                    stack.pop()

if stack:
    print(f"Unclosed '{{' opened at lines: {stack}")
else:
    print("Braces seem balanced (ignoring complex cases).")
